# Reproduce Steps 

## English Version

1. **Create a Next.js app route project**  
   Use `npx create-next-app@latest` to create a project with app routing. Make sure the Next.js version is greater than 15.4.x.

2. **Add OIDC Provider route**  
   Import `oidc-provider` package and create a route.  
   The route URL after project startup: `http://localhost:3000/oauth/oidc`  
   The route code is adapted from the official example [node-oidc-provider](https://github.com/panva/node-oidc-provider), as follows:

   ```ts
   import { NextRequest, NextResponse } from 'next/server';
   import * as oidc from 'oidc-provider';

   const provider = new oidc.Provider('http://localhost:3000', {
     clients: [
       {
         client_id: 'foo',
         client_secret: 'bar',
         redirect_uris: ['http://localhost:8080/cb'],
       },
     ],
   });

   const handler = async (req: NextRequest) => {
     try {
       // Create a promise to handle the oidc-provider callback
       const response = await new Promise<Response>((resolve, reject) => {
         // Mock Node.js request and response objects for oidc-provider
         const nodeReq = {
           method: req.method,
           url: req.url,
           headers: Object.fromEntries(req.headers.entries()),
           body: req.body,
         };

         let responseData = {
           statusCode: 200,
           headers: {} as Record<string, string>,
           body: '',
         };

         const nodeRes = {
           statusCode: 200,
           setHeader: (name: string, value: string) => {
             responseData.headers[name] = value;
           },
           writeHead: (statusCode: number, headers?: Record<string, string>) => {
             responseData.statusCode = statusCode;
             if (headers) {
               Object.assign(responseData.headers, headers);
             }
           },
           write: (chunk: string) => {
             responseData.body += chunk;
           },
           end: (chunk?: string) => {
             if (chunk) responseData.body += chunk;
             resolve(new Response(responseData.body, {
               status: responseData.statusCode,
               headers: responseData.headers,
             }));
           },
         };

         // Get the OIDC provider callback middleware
         const callback = provider.callback();
         callback(nodeReq as any, nodeRes as any, (err?: Error) => {
           if (err) {
             reject(err);
           } else if (!responseData.body) {
             // If no response was sent, send a default response
             resolve(new Response('OK', { status: 200 }));
           }
         });
       });

       return response;
     } catch (error) {
       console.error('OIDC Provider error:', error);
       return new NextResponse('Internal Server Error', { status: 500 });
     }
   };

   export const GET = handler;
   export const POST = handler;
   export const PUT = handler;
   export const DELETE = handler;
   export const PATCH = handler;
   ```

3. **Start the project with Turbopack enabled**  
   Open Turbopack and run the project.  
   Visit `http://localhost:3000/oauth/oidc`, you will see the error:  
   `Cannot read properties of undefined (reading 'length')`

<img width="2000" height="1172" alt="image" src="https://github.com/user-attachments/assets/bbf10491-58ad-4f89-a12e-4c2b6585bf20" />


4. **Start the project with Turbopack disabled**  
   Stop Turbopack and start the project again.  
   The error disappears.


---

## 中文版

1. **创建 Next.js app route 项目**  
   使用 `npx create-next-app@latest` 创建一个带有 app 路由的项目，Next.js 版本需大于 15.4.x。

2. **添加 OIDC Provider 路由**  
   引入 `oidc-provider`，编写一个路由。  
   项目启动后访问路由地址为：`http://localhost:3000/oauth/oidc`  
   路由代码参考官方示例 [node-oidc-provider](https://github.com/panva/node-oidc-provider)，代码如下：

   ```ts
   import { NextRequest, NextResponse } from 'next/server';
   import * as oidc from 'oidc-provider';

   const provider = new oidc.Provider('http://localhost:3000', {
     clients: [
       {
         client_id: 'foo',
         client_secret: 'bar',
         redirect_uris: ['http://localhost:8080/cb'],
       },
     ],
   });

   const handler = async (req: NextRequest) => {
     try {
       // 创建 Promise 来处理 oidc-provider 回调
       const response = await new Promise<Response>((resolve, reject) => {
         // 模拟 Node.js 的 req 和 res 对象供 oidc-provider 使用
         const nodeReq = {
           method: req.method,
           url: req.url,
           headers: Object.fromEntries(req.headers.entries()),
           body: req.body,
         };

         let responseData = {
           statusCode: 200,
           headers: {} as Record<string, string>,
           body: '',
         };

         const nodeRes = {
           statusCode: 200,
           setHeader: (name: string, value: string) => {
             responseData.headers[name] = value;
           },
           writeHead: (statusCode: number, headers?: Record<string, string>) => {
             responseData.statusCode = statusCode;
             if (headers) {
               Object.assign(responseData.headers, headers);
             }
           },
           write: (chunk: string) => {
             responseData.body += chunk;
           },
           end: (chunk?: string) => {
             if (chunk) responseData.body += chunk;
             resolve(new Response(responseData.body, {
               status: responseData.statusCode,
               headers: responseData.headers,
             }));
           },
         };

         // 获取 oidc-provider 的回调中间件
         const callback = provider.callback();
         callback(nodeReq as any, nodeRes as any, (err?: Error) => {
           if (err) {
             reject(err);
           } else if (!responseData.body) {
             // 如果没有返回内容则默认返回 OK
             resolve(new Response('OK', { status: 200 }));
           }
         });
       });

       return response;
     } catch (error) {
       console.error('OIDC Provider error:', error);
       return new NextResponse('Internal Server Error', { status: 500 });
     }
   };

   export const GET = handler;
   export const POST = handler;
   export const PUT = handler;
   export const DELETE = handler;
   export const PATCH = handler;
   ```

3. **打开 Turbopack 启动项目**  
   使用 Turbopack 启动项目。  
   访问 `http://localhost:3000/oauth/oidc`，会看到报错：  
   `Cannot read properties of undefined (reading 'length')`

   <img width="2000" height="1172" alt="image" src="https://github.com/user-attachments/assets/bbf10491-58ad-4f89-a12e-4c2b6585bf20" />


5. **关闭 Turbopack 启动项目**  
   关闭 Turbopack，重新启动项目。  
   报错消失。
