import { Response } from 'express';

export const createError = (
    errorCode: string,
    errorMessage: string,
    messageVars: any[] = [],
    numericErrorCode: number,
    error: string | undefined,
    statusCode: number,
    res: Response
) => {
    res.set({
        'X-Epic-Error-Name': errorCode,
        'X-Epic-Error-Code': numericErrorCode,
    });

    res.status(statusCode).json({
        errorCode,
        errorMessage,
        messageVars,
        numericErrorCode,
        originatingService: 'any',
        intent: 'prod',
        error_description: errorMessage,
        error,
    });
};
