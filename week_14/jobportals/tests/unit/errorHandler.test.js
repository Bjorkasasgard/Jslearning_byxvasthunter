const { notFound, errorHandler } = require('../../middleware/error');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
}

describe('middleware/error', () => {
  test('notFound forwards 404 error', () => {
    const next = jest.fn();
    notFound({}, {}, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });

  test('errorHandler returns JSON for API routes with code and stack in dev', () => {
    const err = Object.assign(new Error('boom'), { status: 418, code: 'E_TEAPOT' });
    const req = { path: '/api/example', app: { get: () => 'development' } };
    const res = mockRes();

    errorHandler(err, req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ status: 418, message: 'boom', code: 'E_TEAPOT', stack: expect.any(String) }),
      })
    );
  });

  test('errorHandler hides stack in production and renders HTML for non-API', () => {
    const err = Object.assign(new Error('fail'), { status: 500 });
    const req = { path: '/web/page', app: { get: () => 'production' } };
    const res = mockRes();

    errorHandler(err, req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith('error', expect.objectContaining({ title: 'Something went wrong' }));
    expect(res.locals.error.stack).toBeUndefined();
  });
});