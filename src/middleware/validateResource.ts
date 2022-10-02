import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import logger from "../utils/logger";

const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        })

        next()
    } catch(error) {
        const err = error as ZodError;
        logger.error(err)
        
        res.status(400).json({ err })
    }
}

export default validate