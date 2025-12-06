const { mapSchema, getDirective, MapperKind } = require('@graphql-tools/utils');

export const authDirective = `
    directive @auth on FIELD_DEFINITION
`;

export function authDirectiveTransformer(schema) {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const directives = getDirective(schema, fieldConfig, "auth");

            if (directives?.length) {
                const { resolve = defaultFieldResolver } = fieldConfig;

                fieldConfig.resolve = async function (source, args, context, info) {
                    if (!context.user) {
                        throw new Error("Unauthorized");
                    }
                    return resolve.call(this, source, args, context, info);
                }
            }
            return fieldConfig;
        }
    })
}