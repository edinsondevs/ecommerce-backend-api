import { errorHandler } from "../plugins/errorHandler";
import { describe, it, expect, vi } from "vitest";

describe("⚙️ Manejador de Errores (errorHandler.ts)", () => {
    
    it("1. Debería capturar y formatear errores de validación (Zod)", () => {
        // 1. Simulamos un error de validación típico de Fastify/Zod
        const validationError = {
            statusCode: 400,
            validation: [
                { message: "El nombre es requerido", path: "name" },
                { message: "El precio debe ser mayor a 0", path: "price" }
            ],
            message: "Validation failed"
        };

        // 2. Creamos objetos simulados para request y reply
        const mockRequest = {} as any;
        const mockReply = {
            status: vi.fn().mockReturnThis(), // Para poder encadenar .send()
            send: vi.fn()
        };

        // 3. Ejecutamos el handler
        errorHandler(validationError as any, mockRequest, mockReply as any);

        // 4. Verificamos que devolvió 400
        expect(mockReply.status).toHaveBeenCalledWith(400);

        // 5. Verificamos que el payload enviado al cliente es correcto
        const responseBody = mockReply.send.mock.calls[0][0];
        expect(responseBody.status).toBe("error");
        expect(responseBody.message).toBe("Datos de entrada inválidos");
        expect(responseBody.details).toEqual(validationError.validation);
    });

    it("2. Debería manejar errores de base de datos P2002 (Conflicto)", () => {
        
        // 1. Simulamos un error de base de datos P2002
        const dbError = {
            code: "P2002",
            meta: { target: ["sku"] },
            message: "Unique constraint failed on the constraint: Product_sku_key"
        };

        // 2. Creamos objetos simulados para request y reply
        const mockReply = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn()
        };

        // 3. Ejecutamos el handler
        errorHandler(dbError as any, {} as any, mockReply as any);

        // 4. Verificamos que devolvió 409
        expect(mockReply.status).toHaveBeenCalledWith(409);
        // 5. Verificamos que el payload enviado al cliente es correcto
        const body = mockReply.send.mock.calls[0][0];
        expect(body.status).toBe("error");
        expect(body.message).toBe("Conflicto: El registro ya existe en la base de datos.");
        expect(body.target).toEqual(["sku"]);
    });

    it("3. Debería manejar errores de base de datos P2025 (No encontrado)", () => {
        
        // 1. Simulamos un error de base de datos P2025
        const notFoundError = {
            code: "P2025",
            message: "Record not found"
        };

        // 2. Creamos objetos simulados para request y reply
        const mockReply = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn()
        };

        // 3. Ejecutamos el handler
        errorHandler(notFoundError as any, {} as any, mockReply as any);

        // 4. Verificamos que devolvió 404
        expect(mockReply.status).toHaveBeenCalledWith(404);
        // 5. Verificamos que el payload enviado al cliente es correcto
        const body = mockReply.send.mock.calls[0][0];
        expect(body.status).toBe("error");
        expect(body.message).toBe("El recurso solicitado no existe.");
    });

    it("4. Debería manejar errores genéricos (500)", () => {
        
        // 1. Simulamos un error genérico
        const genericError = new Error("Error inesperado en el servidor");
        
        // Para que el errorHandler lo trate como 500, le asignamos statusCode
        (genericError as any).statusCode = 500;

        // 2. Creamos objetos simulados para request y reply
        const mockReply = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn()
        };

        // 3. Ejecutamos el handler
        errorHandler(genericError as any, {} as any, mockReply as any);

        // 4. Verificamos que devolvió 500
        expect(mockReply.status).toHaveBeenCalledWith(500);
        // 5. Verificamos que el payload enviado al cliente es correcto
        const body = mockReply.send.mock.calls[0][0];
        expect(body.status).toBe("error");
        expect(body.message).toBe("Error interno del servidor. Por favor, contacte a soporte.");
    });
});