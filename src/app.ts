import Fastify from 'fastify';
import {
	serializerCompiler,
	validatorCompiler,
	ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { productRoutes } from './routes/product.routes.js';
import { errorHandler } from './plugins/errorHandler.js';

/*******************************************************************************
* @description: Implementación del Servidor (El Corazón con Fastify)
* Usaremos fastify-type-provider-zod para que el autocompletado sea perfecto.
********************************************************************************/

// Instanciamos Fastify y le decimos: "Tus tipos van a venir de Zod"
const app = Fastify({
	logger: {
		level: 'error',
	},
}).withTypeProvider<ZodTypeProvider>();

// Configuración de validadores Zod para Fastify - Le inyectamos los "compiladores" 
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Inyectamos el manejador de errores personalizado
app.setErrorHandler(errorHandler);
// Registro de rutas
app.register(productRoutes, { prefix: '/api' });

const start = async () => {
	try {
		await app.listen({ port: 3000 });
		console.log('🚀 Fastify Server Ready at http://localhost:3000');
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();
