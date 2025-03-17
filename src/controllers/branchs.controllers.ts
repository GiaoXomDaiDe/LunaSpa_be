import { Request, Response } from 'express'

export const getBranchsController = async (req: Request, res: Response) => {
  const branchs = await branchsService.getBranchs()
  res.status(200).json(branchs)
}
