import { describe, it, except } from 'vitest';
import { 
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    InternalServerError
 } from '../../../utils/errorClasses.util.js';

describe('Error Classes', () => {

    describe('AppError', () => {
        it('should create an error with default status code', () => {
            const error = new AppError('Test error');

            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(500);
            expect(error.isOperational).toBe(true);
        });

        it('should create an error with custom status code', () => {
            const error = new AppError('Custom Error', 418);

            expect(error.statusCode).toBe(418);
            expect(error.message).toBe('Custom Error');
        });

        it('should have stack trace', () => {
            const error = new AppError('Test Error');

            expect (error.stack).toBeDefined();
        });
    });

    describe('BadRequestError', () => {
        it('should create 400 error', () => {
            const error = new BadRequestError('Invalid input');

            expect(error.statusCode).toBe(400);
            expect(error.message).toBe('Invalid input');
            expect(error.isOperational).toBe(true);
        });

        it('should have default message', () => {
            const error = new BadRequestError();

            expect(error.message).toBe('Bad Request');
        });
    });

    describe('UnauthorizedError', () => {
        it('should create 401 error', () => {
            const error = new UnauthorizedError('Not authenticated');

            expect(error.statusCode).toBe(401);
            expect(error.message).toBe('Not authenticated');
        });

        it('should have default message', () => {
            const error = new UnauthorizedError();

            expect(error.message).toBe('Unauthorized')
        });
    });

    describe('ForbiddenError', () => {
        it('should create 403 error', () => {
            const error = new ForbiddenError('Access denied');

            expect(error.statusCode).toBe(403);
            expect(error.message).toBe('Access denied');
        });
    });

    describe('NotFoundError', () => {
        it('should create 404 error', () => {
            const error = new NotFoundError('User not found');
            
            expect(error.statusCode).toBe(404);
            expect(error.message).toBe('User not found');
        });
    });

    describe('ConflictError', () => {
        it('should create 409 error', () => {
            const error = new ConflictError('Email already exists');

            expect(error.statusCode).toBe(409);
            expect(error.message).toBe('Email already exists');
        });
    })

    describe('InternalServerError', () => {
        it('should create 500 error', () => {
            const error = new InternalServerError('Server crashed');

            expect(error.statusCode).toBe(500);
            expect(error.message).toBe('Server crashed');
        });
    });

});