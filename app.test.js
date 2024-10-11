const request = require('supertest');
const app = require('./app');

let server;

jest.setTimeout(10000); // 10,000ms = 10 seconds
beforeAll((done) => {
  server = app.listen(0, () => {
      // Log the server's port number to debug potential issues
      const { port } = server.address();
      console.log(`Test server running on port ${port}`);
      done();
  });
});

afterAll((done) => {
    server.close(done); // This closes the server after the tests
});

describe('GET /stats', () => {
  it('should return the correct cryptocurrency stats for bitcoin', async () => {
      const response = await request(app).get('/stats?coin=bitcoin');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('price');
      expect(response.body).toHaveProperty('marketCap');
      expect(response.body).toHaveProperty('24hChange');
  });

  it('should return 404 if no data is found for the specified coin', async () => {
      const response = await request(app).get('/stats?coin=nonexistentcoin');
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Data not found for the specified coin');
  });
});