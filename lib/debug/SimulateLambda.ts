import http from 'http';

export class SimulateLamdba {
  static run(port: number, handler: (event: any, context: any) => Promise<any>, ) {
    http.createServer(async (req, res) => {
      const { headers, method, url } = req;
      let body: any = [];
      req.on('error', (err) => {
        console.error(err);
      }).on('data', (chunk) => {
        body.push(chunk);
      }).on('end', async () => {
        body = Buffer.concat(body).toString();

        res.on('error', (err) => {
          console.error(err);
        });

        console.log('BODY', body);
        const wrapped = {
            headers: req.headers,
            httpMethod: (req as any).httpMethod || req.method || 'POST',
            body
          };
        const rv = await handler(wrapped, {});
        res.writeHead(rv.statusCode, rv.headers);
        res.end(rv.body);
      });
    }).listen(port);
  }
}

