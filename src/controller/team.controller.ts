import {PrismaClient} from '@prisma/client';
const primsa = new PrismaClient();
import tournament from '../services/tournament.service';
import team from '../services/team.service';
import {Request, Response} from 'express';
import HttpException from '../utils/HttpException.utils';
import {DotenvConfig} from '../config/env.config';
class TeamController {
  async createTeam(req: Request, res: Response) {
    const baseUrl = `${req.protocol}://${req.get('host')}`

    const userId = req.user?.id;
    console.log("🚀 ~ TeamController ~ createTeam ~ userId:", userId)

    const files = req.files as {[fieldname: string]: Express.Multer.File[]} | undefined;
    const team_icon = files?.['image']
    ? `${baseUrl}/${files['image'][0].path.replace(/\\/g, '/')}` // Replace backslashes for Windows
    : null;
    
    
if(!team_icon){
  throw new Error('team icon is required')
}
    const {team_name, max_players, description} = req.body;
   
    const create = await team.createTeam(team_name, max_players, description, team_icon, userId as string);
    console.log("🚀 ~ TeamController ~ createTeam ~ create:", create)
    return res.status(200).json({
      data: create,
    });
  }

  async uploadTeamMedia(req: Request, res: Response) {
    try {
      const baseUrl = DotenvConfig.BASE_URL
      const userId = req.user?.id;
  
      if (!userId) {
        throw HttpException.unauthorized('Unauthorized user');
      }
  
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  
      const mediaFiles = files?.image || files?.media;
  
      if (!mediaFiles || mediaFiles.length === 0) {
        throw HttpException.badRequest('No media files uploaded');
      }
  
      const defaultType = req.body.type;
  
      const uploadedMedia = await Promise.all(
        mediaFiles.map(async (file) => {
          // Append baseUrl to the image/media path
          const cleanPath = file.path.replace(/\\/g, '/'); // handle Windows slashes
          const mediaUrl = `${baseUrl}/${cleanPath}`;
          const type = defaultType || file.mimetype.split('/')[0]; // image, video, etc.
          return await team.addTeamMedia(mediaUrl, type, Number(userId));
        })
      );
  
      return res.status(200).json({
        message: 'Media files uploaded successfully',
        data: uploadedMedia,
      });
    } catch (error: any) {
      console.error('Error in uploadTeamMedia:', error);
      return res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
  }
  async getTeamMedia(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw HttpException.unauthorized('Unauthorized user');
      }
  
  
      const media = await team.getTeamMedia( Number(userId));
  
      return res.status(200).json({
        message: 'Media files fetched successfully',
        data: media,
      });
    } catch (error: any) {
      console.error('Error in getTeamMedia:', error);
      return res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
  }
  async getAllTeams(req: Request, res: Response) {
    const teams = await team.getAllTeams();
    return res.status(200).json({
      data: teams,
    });
    
  }
  async leaveTeam(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw HttpException.unauthorized('Unauthorized user');
    }
    const leave = await team.leaveTeam(userId as string);
    return res.status(200).json({
      data: leave,
    });
  }
  async changeTeamLeader (req: Request, res: Response)  {
    const userId = req.user?.id;
    console.log("🚀 ~ TeamController ~ changeTeamLeader ~ userId:", userId)
    if (!userId) {
      throw HttpException.unauthorized('Unauthorized user');
    }
    const {teamId, newLeaderId} = req.body;
    const change = await team.changeTeamLeader( teamId,userId as string, newLeaderId);
    return res.status(200).json({
      data: change,
    });
  } 
async removeTeamMember (req: Request, res: Response)  {
  const userId = req.user?.id;
  console.log("🚀 ~ TeamController ~ removeTeamMember ~ userId:", userId)
  if (!userId) {
    throw HttpException.unauthorized('Unauthorized user');
  }
  const {teamId, memberId} = req.body;
  const remove = await team.removePlayer( teamId,userId as string, memberId);
  return res.status(200).json({
    data: remove,
  });

  
}
async updateTeam(req:Request,res:Response){
  try{
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const files = req.files as {[fieldname: string]: Express.Multer.File[]} | undefined;
    console.log("🚀 ~ TeamController ~ updateTeam ~ baseUrl:", baseUrl)
    const team_icon = files?.['image']
    ? `${baseUrl}/${files['image'][0].path.replace(/\\/g, '/')}` // Replace backslashes for Windows
    : null;
    
    const {team_name, max_players, description} = req.body;
    const id = req.params.id;
    console.log("🚀 ~ TeamController ~ updateTeam ~ id:", id)
    if(!id){
      throw new Error('team id is required')
    }
    const update = await team.updateTeam(id,team_name,max_players,description,team_icon)
    console.log("🚀 ~ TeamController ~ updateTeam ~ update:", update)
    return res.status(200).json({
      data: update,
    });
  }catch(error){
    res.status(400).json({Message:error.message})
  }
}
async deleteTeam(req:Request,res:Response){
  try{
 const teamId = req.params.id;
  const userId= req.user?.id;
  if(!teamId){
    throw new Error('team id is required')
  }
  const deleteTeam = await team.deleteTeam(teamId,userId as string)
  return res.status(200).json({
    data: deleteTeam,
  });
  }catch(eror){
    console.log("🚀 ~ TeamController ~ deleteTeam ~ eror:", eror)
    
  }
 
}
}

export default new TeamController();
