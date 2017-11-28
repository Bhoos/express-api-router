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
      const postCall = mockRouter.post.mock.calls[0];
      expect(getCall1[0]).toBe('/level0/level00/:id');
      expect(getCall2[0]).toBe('/level0/level01');
      expect(postCall[0]).toBe('/level0/level02');
    });


  });

});
