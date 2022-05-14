import swaggerJsDoc from 'swagger-jsdoc';

// Swagger options
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Anki API',
            version: '0.0.1',
            description: 'An api of japanese kanji for the anki application',
        },
        servers: [{ url: '/' }],
    },
    apis: ['./src/controllers/*.ts'],
}
export const specs = swaggerJsDoc(options);
