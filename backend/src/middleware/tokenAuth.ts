import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import Company from "../models/Company";

type HeaderParams = {
  Bearer: string;
};

const tokenAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization.replace('Bearer ', '');
    const whatsapp = await Whatsapp.findOne({ 
        where: { token },
        include: [{ model: Company }]
    });
    if (whatsapp) {
      if (new Date(whatsapp.company.dueDate) < new Date()) {
        throw new AppError(
          "Acesso não permitido",
          401
        );
      }
      req.params = {
        whatsappId: whatsapp.id.toString()
      }
    } else {
      throw new Error();
    }
  } catch (err) {
    throw new AppError(
      "Acesso não permitido",
      401
    );
  }

  return next();
};

export default tokenAuth;
