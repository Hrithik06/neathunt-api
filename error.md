# DB ERRORS
Error Reference https://www.prisma.io/docs/orm/reference/error-reference
  ```ts
Server running on port 4000
 Auth Middleware
 prisma:error
 Invalid `prisma.user.findUnique()` invocation in
 /home/olifck/Dev/wheredidiapply/neathunt-api/src/services/user.service.ts:106:22

   103   });
   104 }
   105 export async function getSafeUserById(userId: string) {
 → 106   return prisma.user.findUnique(
 Can't reach database server at ep-snowy-block-a1skyny6-pooler.ap-southeast-1.aws.neon.tech
 ::1 - - [21/Jul/2026:14:16:49 +0000] "GET /api/gmail/sync HTTP/1.1" 401 24 "-" "bruno-runtime/3.5.2"




 Auth Middleware
 prisma:error
 Invalid `prisma.user.findUnique()` invocation in
 /home/olifck/Dev/wheredidiapply/neathunt-api/src/services/user.service.ts:106:22

   103   });
   104 }
   105 export async function getSafeUserById(userId: string) {
 → 106   return prisma.user.findUnique(
 Can't reach database server at ep-snowy-block-a1skyny6-pooler.ap-southeast-1.aws.neon.tech
 PrismaClientKnownRequestError:
 Invalid `prisma.user.findUnique()` invocation in
 /home/olifck/Dev/wheredidiapply/neathunt-api/src/services/user.service.ts:106:22

   103   });
   104 }
   105 export async function getSafeUserById(userId: string) {
 → 106   return prisma.user.findUnique(
 Can't reach database server at ep-snowy-block-a1skyny6-pooler.ap-southeast-1.aws.neon.tech
     at zr.handleRequestError (/home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+client@7.8.0_prisma@7.8.0_@types+react@19.2.17_react-dom@19.2.7_react@19.2.7__r_1ecf58f6845be1ff739a116e73f122a6/node_modules/@prisma/client/src/runtime/RequestHandler.ts:237:13)
     at zr.handleAndLogRequestError (/home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+client@7.8.0_prisma@7.8.0_@types+react@19.2.17_react-dom@19.2.7_react@19.2.7__r_1ecf58f6845be1ff739a116e73f122a6/node_modules/@prisma/client/src/runtime/RequestHandler.ts:183:12)
     at zr.request (/home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+client@7.8.0_prisma@7.8.0_@types+react@19.2.17_react-dom@19.2.7_react@19.2.7__r_1ecf58f6845be1ff739a116e73f122a6/node_modules/@prisma/client/src/runtime/RequestHandler.ts:152:12)
     at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
     at async a (/home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+client@7.8.0_prisma@7.8.0_@types+react@19.2.17_react-dom@19.2.7_react@19.2.7__r_1ecf58f6845be1ff739a116e73f122a6/node_modules/@prisma/client/src/runtime/getPrismaClient.ts:963:24)
     at async authMiddleware (/home/olifck/Dev/wheredidiapply/neathunt-api/src/middlewares/auth.middleware.ts:19:18) {
   code: 'P1001',
   meta: {
     modelName: 'User',
     driverAdapterError: DriverAdapterError: DatabaseNotReachable
         at PrismaPgAdapter.onError (file:///home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+adapter-pg@7.8.0/node_modules/@prisma/adapter-pg/dist/index.mjs:642:11)
         at PrismaPgAdapter.performIO (file:///home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+adapter-pg@7.8.0/node_modules/@prisma/adapter-pg/dist/index.mjs:637:12)
         at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
         at async PrismaPgAdapter.queryRaw (file:///home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+adapter-pg@7.8.0/node_modules/@prisma/adapter-pg/dist/index.mjs:568:30)
         at async o (/home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+client@7.8.0_prisma@7.8.0_@types+react@19.2.17_react-dom@19.2.7_react@19.2.7__r_1ecf58f6845be1ff739a116e73f122a6/node_modules/@prisma/client-engine-runtime/src/tracing.ts:66:26)
         at async e.interpretNode (/home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+client@7.8.0_prisma@7.8.0_@types+react@19.2.17_react-dom@19.2.7_react@19.2.7__r_1ecf58f6845be1ff739a116e73f122a6/node_modules/@prisma/client-engine-runtime/src/interpreter/query-interpreter.ts:186:26)
         at async e.interpretNode (/home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+client@7.8.0_prisma@7.8.0_@types+react@19.2.17_react-dom@19.2.7_react@19.2.7__r_1ecf58f6845be1ff739a116e73f122a6/node_modules/@prisma/client-engine-runtime/src/interpreter/query-interpreter.ts:213:41)
         at async e.interpretNode (/home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+client@7.8.0_prisma@7.8.0_@types+react@19.2.17_react-dom@19.2.7_react@19.2.7__r_1ecf58f6845be1ff739a116e73f122a6/node_modules/@prisma/client-engine-runtime/src/interpreter/query-interpreter.ts:272:41)
         at async e.run (/home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+client@7.8.0_prisma@7.8.0_@types+react@19.2.17_react-dom@19.2.7_react@19.2.7__r_1ecf58f6845be1ff739a116e73f122a6/node_modules/@prisma/client-engine-runtime/src/interpreter/query-interpreter.ts:94:23)
         at async e.execute (/home/olifck/Dev/wheredidiapply/neathunt-api/node_modules/.pnpm/@prisma+client@7.8.0_prisma@7.8.0_@types+react@19.2.17_react-dom@19.2.7_react@19.2.7__r_1ecf58f6845be1ff739a116e73f122a6/node_modules/@prisma/client/src/runtime/core/engines/client/LocalExecutor.ts:81:12) {
       cause: [Object]
     }
   },
   clientVersion: '7.8.0'
 }
 ::1 - - [21/Jul/2026:14:19:24 +0000] "GET /api/gmail/sync HTTP/1.1" 401 24 "-" "bruno-runtime/3.5.2"

  ```
