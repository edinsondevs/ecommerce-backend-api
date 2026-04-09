import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import app, { start } from "../app"; // 👈 Asegúrate de que esta ruta apunte a tu app.ts real

describe("⚙️ Integration Tests: Servidor Principal (app.ts)", () => {
	// 1. Configuramos Fastify ANTES de que cierre sus rutas
	beforeAll(async () => {
		// MAGIA DE TESTING: Creamos una ruta temporal al vuelo SOLO para probar el decorador JWT.
		// Debe registrarse ANTES de llamar a app.ready()
		app.get(
			"/ruta-super-secreta-de-prueba",
			{
				onRequest: [app.authenticate],
			},
			async (request, reply) => {
				return reply.send({ success: true, message: "Entraste" });
			},
		);

		// Ahora sí, esperamos a que Fastify cargue TODOS sus plugins asíncronos (Swagger, JWT) y ponga el candado.
		await app.ready();
	});

	// 2. Cerramos la instancia al terminar la suite para liberar la memoria del puerto
	afterAll(async () => {
		await app.close();
	});

	it("1. Debería instanciar el servidor y manejar rutas inexistentes (404 Global)", async () => {
		const response = await app.inject({
			method: "GET",
			url: "/ruta-que-no-existe-en-el-sistema",
		});

		// Fastify por defecto maneja los 404 cuando no encuentra una ruta
		expect(response.statusCode).toBe(404);

		const body = JSON.parse(response.payload);
		expect(body.message).toContain(
			"Route GET:/ruta-que-no-existe-en-el-sistema not found",
		);
	});

	it("2. Debería haber cargado el plugin de Swagger UI en la ruta /docs", async () => {
		const response = await app.inject({
			method: "GET",
			url: "/docs",
		});

		// fastify-swagger-ui suele devolver 302 (redirección a /docs/) o 200 con el HTML.
		// Verificamos que no sea un 404 ni un 500.
		expect([200, 302]).toContain(response.statusCode);
	});

	it("3. El Guardia (app.authenticate) debería rechazar peticiones sin token (401)", async () => {
		// Intentamos entrar SIN token a la ruta secreta
		const response = await app.inject({
			method: "GET",
			url: "/ruta-super-secreta-de-prueba",
		});

		// Verificamos que el decorador que escribiste en app.ts lance exactamente el error programado
		expect(response.statusCode).toBe(401);

		const body = JSON.parse(response.payload);
		expect(body.status).toBe("error");
		expect(body.message).toBe("Token faltante o inválido");
	});

	it("4. El Guardia (app.authenticate) debería dejar pasar con un token válido", async () => {
		// Firmamos un token falso usando la misma instancia de app
		const validToken = app.jwt.sign({ id: "123", role: "ADMIN" });

		// Intentamos entrar a la ruta temporal CON el token
		const response = await app.inject({
			method: "GET",
			url: "/ruta-super-secreta-de-prueba",
			headers: {
				Authorization: `Bearer ${validToken}`,
			},
		});

		// Verificamos que nos deje pasar (200 OK)
		expect(response.statusCode).toBe(200);

		const body = JSON.parse(response.payload);
		expect(body.success).toBe(true);
		expect(body.message).toBe("Entraste");
	});
});


describe('⚙️ Cobertura de la función de arranque (start)', () => {
        
        it('5. Debería arrancar el servidor correctamente (app.listen)', async () => {
            // 1. Interceptamos app.listen para que no levante un puerto real
            const mockListen = vi.spyOn(app, 'listen').mockResolvedValue('http://localhost:3000' as any);

            // 2. Ejecutamos nuestra función start
            await start();

            // 3. Verificamos que intentó levantar el servidor
            expect(mockListen).toHaveBeenCalled();

            mockListen.mockRestore();
        });

        it('6. Debería hacer process.exit(1) si el servidor falla al arrancar', async () => {
            // 1. Simulamos que el puerto está ocupado (app.listen lanza error)
            const mockListen = vi.spyOn(app, 'listen').mockRejectedValue(new Error('Puerto ocupado'));
            
            // 2. Interceptamos el logger para que no ensucie la consola del test
            const mockLogError = vi.spyOn(app.log, 'error').mockImplementation(() => {});
            
            // 3. ¡MUY IMPORTANTE! Interceptamos process.exit para que no apague Vitest
            const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

            // 4. Ejecutamos la función start
            await start();

            // 5. Verificamos que atrapó el error, lo logueó y mandó a apagar el proceso
            expect(mockLogError).toHaveBeenCalled();
            expect(mockExit).toHaveBeenCalledWith(1); // 👈 Verifica la línea: process.exit(1)

            // Limpieza general
            mockListen.mockRestore();
            mockLogError.mockRestore();
            mockExit.mockRestore();
        });
    });