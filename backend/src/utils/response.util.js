/**
 * 
 * @param {Object} res Express response object
 * @param {*} data Response data
 * @param {*} message Success message
 * @param {number} statusCode HTTP Status Code (default: 200)
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

export const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response)
}