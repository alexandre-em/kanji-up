import swaggerJsDoc from 'swagger-jsdoc';

// Swagger options
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Kanji-Up API',
            version: '0.0.1',
            description: 'An api of japanese kanji for the Kanji-Up application',
            contact: {
                name: "Alexandre Em",
                url: "https://alexandre-em.fr",
                email: "alexandre.em@pm.me"
            },
        },
        servers: [{ url: '/' }],
    },
    apis: ['./src/controllers/*.ts'],
}
export const specs = swaggerJsDoc(options);
