import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { verifyAccessToken } from '../../../utils/jwt.util.js';
import User from '../../../model/User.js';

vi.mock('../../../utils/jwt.util.js');
vi.mock('../../../model/User.js');

describe('authMiddleware - JWT Error Handling', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer test-token-here'
      }
    };
    res = {};
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('should call next with UnauthorizedError when token is expired', async () => {
    // Mock jwt.verify to throw TokenExpiredError
    const expiredError = new Error('jwt expired');
    expiredError.name = 'TokenExpiredError';
    expiredError.expiredAt = new Date();

    verifyAccessToken.mockImplementation(() => {
      throw expiredError;
    });

    // Execute middleware
    await authMiddleware(req, res, next);

    // Verify next was called with an error
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Token expired'
    }));

    // Verify user lookup was NOT attempted
    expect(User.findById).not.toHaveBeenCalled();
  });

  it('should call next with UnauthorizedError when token is invalid', async () => {
    // Mock jwt.verify to throw JsonWebTokenError
    const invalidError = new Error('invalid signature');
    invalidError.name = 'JsonWebTokenError';

    verifyAccessToken.mockImplementation(() => {
      throw invalidError;
    });

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Invalid token'
    }));
    expect(User.findById).not.toHaveBeenCalled();
  });

  it('should call next with UnauthorizedError when token is not active yet', async () => {
    // Mock jwt.verify to throw NotBeforeError
    const notBeforeError = new Error('jwt not active');
    notBeforeError.name = 'NotBeforeError';
    notBeforeError.date = new Date();

    verifyAccessToken.mockImplementation(() => {
      throw notBeforeError;
    });

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Token not active yet'
    }));
    expect(User.findById).not.toHaveBeenCalled();
  });

  it('should proceed when token is valid', async () => {
    const mockDecoded = { userId: 'user123' };
    const mockUser = {
      _id: 'user123',
      email: 'test@test.com',
      isActive: true,
      toJSON: vi.fn().mockReturnValue({
        _id: 'user123',
        email: 'test@test.com',
        isActive: true
      })
    };

    verifyAccessToken.mockReturnValue(mockDecoded);
    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue(mockUser)
    });

    await authMiddleware(req, res, next);

    // Verify next was called with NO arguments (success)
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();

    expect(req.user).toEqual({
      _id: 'user123',
      email: 'test@test.com',
      isActive: true
    });
    expect(mockUser.toJSON).toHaveBeenCalled();
  });

  it('should call next with UnauthorizedError when no token is provided', async () => {
    req.headers.authorization = undefined;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'No token provided'
    }));
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it('should call next with UnauthorizedError when authorization header does not start with Bearer', async () => {
    req.headers.authorization = 'Basic some-credentials';

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'No token provided'
    }));
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });
});
