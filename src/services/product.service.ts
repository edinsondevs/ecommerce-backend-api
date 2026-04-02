import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**************************************************************
* @description: Lógica de Negocio (Service + Route)
* Aquí es donde se implementa la lógica de negocio, interactuando con la base de datos a través de Prisma.
* @function ProductService: Un objeto que contiene métodos para crear y listar productos.
***************************************************************/

export const ProductService = {
	create: async (data: any) => {
		return await prisma.product.create({ data });
	},
	list: async () => {
		return await prisma.product.findMany({ where: { isActive: true } });
	},
	update: async(id: string, data: any) => {
		return await prisma.product.update({
			where: { id },
			data,
		});
	},
	delete: async (id: string, isDeleteLogic: boolean) => {
		if (isDeleteLogic) {
			return await prisma.product.update({
				where: { id },
				data: { isActive: false },
			});
		}else{
			return await prisma.product.delete({ where: { id } });
		}
	}
};
