import { setupRouter } from '../src';

describe('setupRouter', () => {
  it('must call setup callback', () => {
    const mockRouter = {
      get: jest.fn(),
      post: jest.fn(),
    };
    const api = {};

    const mockSetup = jest.fn();
    setupRouter(mockRouter, api, mockSetup);
    expect(mockSetup.mock.calls).toHaveLength(1);
    expect(mockSetup.mock.calls[0]).toHaveLength(1);
    const r = mockSetup.mock.calls[0][0];
    expect(typeof r.param).toBe('function');
    expect(typeof r.branch).toBe('function');
    expect(typeof r.query).toBe('function');
    expect(typeof r.form).toBe('function');
  });

  it('must setup route on route method', () => {
    const mockRouter = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const mockApi = {
      level0: {
        level00: jest.fn(),
        level01: jest.fn(),
        level02: jest.fn(),
      },
      level1: {
        level10: jest.fn(),
        level11: jest.fn(),
      },
    };

    setupRouter(mockRouter, mockApi, (r) => {
      const b = r.branch('level0');
      expect(typeof b.route).toBe('function');
      expect(typeof b.branch).toBe('function');
      b
        .route('level00', r.param('id'))
        .route('level01', r.query('id'))
        .route('level02', r.form('id'));

      expect(mockRouter.get.mock.calls).toHaveLength(2);
      expect(mockRouter.post.mock.calls).toHaveLength(1);
      const getCall1 = mockRouter.get.mock.calls[0];
      const getCall2 = mockRouter.get.mock.calls[1];
      const postCall1 = mockRouter.post.mock.calls[0];
      expect(getCall1[0]).toBe('/level0/level00/:id');
      expect(getCall2[0]).toBe('/level0/level01');
      expect(postCall1[0]).toBe('/level0/level02');
      r.branch('level1')
        .route('level10', r.param('p1'), r.query('p2'))
        .route('level11', r.query('p1'), r.form('p2'));

      const getCall3 = mockRouter.get.mock.calls[2];
      const postCall2 = mockRouter.post.mock.calls[1];
      expect(getCall3[0]).toBe('/level1/level10/:p1');
      expect(postCall2[0]).toBe('/level1/level11');
    });
  });

  it('must prepare api args from `req`', () => {
    const mockRouter = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const mockApi = {
      level0: {
        level00: jest.fn(),
        level01: jest.fn(),
        level02: jest.fn(),
      },
      level1: {
        level10: jest.fn(),
        level11: jest.fn(),
      },
    };

    setupRouter(mockRouter, mockApi, (r) => {
      r.branch('level0')
        .route('level01', r.param('p1'), r.query('p2'), r.form('p3'));

      const handler = mockRouter.post.mock.calls[0][1];
      const req = {
        session: 'session',
        params: { p1: 'ppp1' },
        query: { p2: 'ppp2' },
        body: { p3: 'ppp3' },
      };
      const res = { json: jest.fn() };
      const response = 'demo-response';
      mockApi.level0.level01.mockReturnValueOnce(response);

      // Perform the request, making the api call
      return handler(req, res).then(() => {
        expect(mockApi.level0.level01.mock.calls).toHaveLength(1);
        const apiCall = mockApi.level0.level01.mock.calls[0];
        // Should pass 4 parameters (including session)
        expect(apiCall).toHaveLength(4);
        expect(apiCall[0]).toBe(req.session);
        expect(apiCall[1]).toBe(req.params.p1);
        expect(apiCall[2]).toBe(req.query.p2);
        expect(apiCall[3]).toBe(req.body.p3);

        // expect response to be passed
        expect(res.json.mock.calls).toHaveLength(1);
        expect(res.json.mock.calls[0][0]).toBe(response);
      });
    });
  });

  it('must return router passed as argument', () => {
    const router = {};
    const api = {};
    expect(setupRouter(router, api, () => {})).toBe(router);
  });
});
