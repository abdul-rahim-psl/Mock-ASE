import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { GraphQLError } from 'graphql';
import { typeDefs } from '@/lib/schema';
// Import Prisma-based resolvers instead of in-memory ones
import { resolvers } from '@/lib/resolvers-postgres';
import { logger } from '@/lib/logger';

// Define type-safe logging plugin
const loggingPlugin = {
  // Called when Apollo Server starts
  serverWillStart(): Promise<void> {
    logger.info('Mock-ASE GraphQL API Server starting...');
    return Promise.resolve();
  },
  
  // Called for each request
  async requestDidStart(requestContext: any) {
    const { request } = requestContext;
    const operationName = request.operationName || 'unnamed operation';
    const startTime = Date.now();

    // Format operation type and name for logging
    logger.api(`GraphQL ${request.operationName ? `[${request.operationName}]` : 'Operation'}`);
    
    return {
      // Called when the operation is parsed
      async didResolveOperation(context: any) {
        const { operation, operationName } = context;
        // logger.debug(`Type: ${operation} | Name: ${operationName || 'unnamed'}`);
      },
      
      // Called when variables are parsed
      async didResolveSource(context: any) {
        const { source } = context;
        
        // Print a simplified version of the query for logs
        const queryPreview = source
          .replace(/\s+/g, ' ')
          .replace(/\{\s+/g, '{ ')
          .replace(/\s+\}/g, ' }')
          .substring(0, 100) + (source.length > 100 ? '...' : '');
          
        // logger.api(`Query: ${queryPreview}`);
        
        // If this is a mutation, log the variables to show what's changing
        if (source.trim().startsWith('mutation')) {
          const variables = JSON.stringify(request.variables);
          logger.api(`Variables: ${variables.length > 200 ? variables.substring(0, 200) + '...' : variables}`);
        }
      },
      
      // Called when the operation is completed
      async willSendResponse(context: any) {
        const { response } = context;
        const duration = Date.now() - startTime;
        
        // Log if there were any errors
        if (response.errors?.length) {
          logger.error(`GraphQL Error: ${response.errors.map((e: any) => e.message).join(', ')}`);
        } else {
          logger.success(`Operation completed in ${duration}ms`);
        }
      }
    };
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    loggingPlugin,
    ApolloServerPluginLandingPageLocalDefault(),
  ],
  formatError: (error) => {
    logger.error(`GraphQL Error: ${error.message}`);
    
    // Return a sanitized error message to the client
    return {
      message: error.message,
      path: error.path,
      extensions: {
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
      }
    };
  }
});

const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST };
