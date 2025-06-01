import HttpException from '../utils/HttpException.utils';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

class TeamService {
 
  async createTeam(
    team_name: string,
    max_players: string,
    description: string,
    team_icon: string,
    user_id: string,
  ) {
    try {
      const ifUserAlreadyOnTeam = await prisma.teamPlayers.findFirst({
        where: {
          user_id: Number(user_id),
        },
      });
      console.log("🚀 ~ TeamService ~ ifUserAlreadyOnTeam:", ifUserAlreadyOnTeam)
      if (ifUserAlreadyOnTeam) {
       console.log("🚀 ~ TeamService ~ ifUserAlreadyOnTeam:", ifUserAlreadyOnTeam)
       throw   HttpException.badRequest(
          `You are already on a team please leave a team to create a new one.`,
        );
      }
      const saved = await prisma.teams.create({
        data: {
          team_name,
          max_players: parseInt(max_players),
          description,
          logo: team_icon,
        },
      });
      const assignLeader = await prisma.teamPlayers.create({
        data: {
          team_id: saved.id,
          user_id: parseInt(user_id),
          role: 'TEAM_LEADER',
        },
      });
      return saved;
    } catch (error) {
 if (error instanceof HttpException) {
          throw new Error(error.message); // GraphQL expects a normal Error with a message
        }
        
        // If it's something else, throw a generic error
        throw new Error('An unexpected error occurred.');
    }
  }
 
  async getTeam() {

    const getAllTeams = await prisma.teams.findMany({
      include: {
        teamPlayers: {
          include: {
            user: {
              select: {
                id:true,
                role:true,
                username: true,
                email: true
              }
            }
          }
        }
      },orderBy:{
          CreatedAt  : 'asc',
          }

    });
    return getAllTeams;
  }
  async getOwnTeams(userId: string) {
    const parsedUserId = parseInt(userId);  
    const userTeam= await prisma.teamPlayers.findFirst({
      where: {  
        user_id: parsedUserId,
      },
      include: {
        team: {
          include: {
            teamPlayers: {
              include: {
                user: {
                  select: {
                    id:true,
                    role:true,
                    username: true,
                    email: true,
                    avatar: true,
                  }
                }
              }
            }
          }
        }
      },
    });
    if (!userTeam) {
      throw HttpException.notFound('User not found or not part of any team.');
    }
    const getOwnTeamPlayers = await prisma.teamPlayers.findMany({
      where: {  
        team_id: userTeam.team_id,
      },
      include: {  
        user: {
          select: {
            id:true,
            role:true,
            username: true,
            email: true,
            avatar: true,
          }
        }
      },
    }); 
    return getOwnTeamPlayers;
  }
  async getOwnTeamDetails(id: string) {
    try {
      const userId = parseInt(id);
      const teamDetails = await prisma.teams.findFirst({
        where: {
          OR: [
            {
              teamPlayers: {
                some: {
                  user_id: userId,
                },
              },
            },
          ],
        },
        include: {
          teamPlayers: {
            select: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
              role: true,
              user_id:true
            },
          },
        },
      });

      if (!teamDetails) {
        return {message: 'No team found for this user'};
      }

      return teamDetails;
    } catch (error) {
      throw new Error('An error occurred while fetching the team details.');
    }
  }
async deleteTeam(teamId: string, userId: string) {
  const teamIdInt = parseInt(teamId);
  const userIdInt = parseInt(userId);

  // Check if the user is a team leader
  const teamLeader = await prisma.teamPlayers.findFirst({
    where: {
      team_id: teamIdInt,
      user_id: userIdInt,
      role: 'TEAM_LEADER',
    },
  });


  const isAdmin = await prisma.user.findUnique({
    where: {
      id: userIdInt,
    },
    select: {
      role: true,
    },
  });

  if (!teamLeader && isAdmin?.role !== 'ADMIN') {
    throw HttpException.forbidden('Only the team leader or an admin can delete the team.');
  }

  const deletedTeam = await prisma.teams.delete({
    where: {
      id: teamIdInt,
    },
  });
  return deletedTeam;
}
  async addPlayer(teamId: string, userId: string, newPlayerId: string) {
    const teamLeader = await prisma.teamPlayers.findFirst({
      where: {
        team_id: parseInt(teamId),
        user_id: parseInt(userId),
        role: 'TEAM_LEADER',
      },
    });
    if (!teamLeader) {
      throw HttpException.forbidden('Only the team leader can add players.');
    }
    const existingPlayer = await prisma.teamPlayers.findFirst({
      where: {user_id: parseInt(newPlayerId)},
    });
    if (existingPlayer) {
      throw HttpException.badRequest('The user is already part of the another team.');
    }
    const team = await prisma.teams.findUnique({
      where: {
        id: parseInt(teamId),
      },
      include: {teamPlayers: true},
    });
    if (!team) {
      throw HttpException.notFound('Team not found.');
    }
    if (team.teamPlayers.length >= team.max_players) {
      throw HttpException.badRequest('The team has reached the maximum number of players.');
    }
    const newPlayer = await prisma.teamPlayers.create({
      data: {
        team_id: parseInt(teamId),
        user_id: parseInt(newPlayerId),
        role: 'PLAYER',
      },
    });
    return newPlayer;
  }
  async removePlayer(teamId: string, userId: string, playerIdToRemove: string) {
    const currentUserRole = await prisma.teamPlayers.findFirst({
      where: {
        team_id: parseInt(teamId),
        user_id: parseInt(userId),
      },
      select: {role: true},
    });
    if (!currentUserRole) {
      throw HttpException.forbidden('You are not part of this team.');
    }

    if (currentUserRole.role !== 'TEAM_LEADER' && parseInt(userId) !== parseInt(playerIdToRemove)) {
      throw HttpException.forbidden('You can only remove yourself from the team.');
    }

    const playerToRemove = await prisma.teamPlayers.findFirst({
      where: {
        team_id: parseInt(teamId),
        user_id: parseInt(playerIdToRemove),
      },
    });
    if (!playerToRemove) {
      throw HttpException.notFound('player to remove not found.');
    }
    if (playerToRemove.role === 'TEAM_LEADER') {
      throw HttpException.badRequest('Cannot remove the team leader. Transfer leadership first.');
    }

    const removedPlayer = await prisma.teamPlayers.delete({
      where: {id: playerToRemove.id},
    });
    return removedPlayer;
  }
  async changeTeamLeader(teamId: string, userId: string, newLeaderId: string) {
    console.log("🚀 ~ TeamService ~ changeTeamLeader ~ userId:", userId)
    console.log("🚀 ~ TeamService ~ changeTeamLeader ~ teamId:", teamId)
    const currentLeader = await prisma.teamPlayers.findFirst({
      where: {
        team_id: parseInt(teamId),
        user_id: parseInt(userId),
        role: 'TEAM_LEADER',
      },
    });
    console.log("🚀 ~ TeamService ~ changeTeamLeader ~ currentLeader:", currentLeader)
    if (!currentLeader) {
      throw HttpException.forbidden('Only the current team leader can transfer leadership.');
    }

    const newLeader = await prisma.teamPlayers.findFirst({
      where: {
        team_id: parseInt(teamId),
        user_id: parseInt(newLeaderId),
      },
    });
    if (!newLeader) {
      throw HttpException.badRequest('The new leader must be a member of the team.');
    }

    await prisma.teamPlayers.update({
      where: {id: currentLeader.id},
      data: {role: 'PLAYER'},
    });

    const updatedNewLeader = await prisma.teamPlayers.update({
      where: {id: newLeader.id},
      data: {role: 'TEAM_LEADER'},
    });
    return updatedNewLeader;
  }
  async getTeamById(teamId: string) {
    const team = await prisma.teams.findUnique({
      where: {id: parseInt(teamId)},
      include: {
        teamPlayers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
    if (!team) {
      throw HttpException.notFound('Team not found.');
    }
    return team;
  }
  /**
   * Code to check if team is full
   */
  async isTeamFull(teamId: string): Promise<boolean> {
    const team = await prisma.teams.findUnique({
      where: {id: parseInt(teamId)},
      include: {teamPlayers: true},
    });
    if (!team) {
      throw HttpException.notFound('Team not found');
    }
    return team.teamPlayers.length >= team.max_players;
  }
  
  async sendJoinRequest(userId: string, teamId: string) {
    console.log('ya?')
    try{

      const parsedUserId = parseInt(userId);
      console.log("🚀 ~ TeamService ~ sendJoinRequest ~ parsedUserId:", parsedUserId)
      const parsedTeamId = parseInt(teamId);
      console.log("🚀 ~ TeamService ~ sendJoinRequest ~ parsedTeamId:", parsedTeamId)
      const teams = await prisma.teams.findUnique({
        where: { id: parsedTeamId },
        include: { 
          teamPlayers: {
            include: {
              user: true // Include the related User data
            }
          }
        },
      });
      console.log("🚀 ~ TeamService ~ sendJoinRequest ~ teams:", teams)
      if (!teams) {
        throw HttpException.notFound('Team not found.');
      }
    
      // Check if user is already in a team
      const existingPlayer = await prisma.teamPlayers.findFirst({
        where: {user_id: parsedUserId},
      });
      console.log("🚀 ~ TeamService ~ sendJoinRequest ~ existingPlayer:", existingPlayer)
      console.log("🚀 ~ TeamService ~ sendJoinRequest ~ existingPlayer:", existingPlayer)
      if (existingPlayer) {
        console.log("🚀 ~ TeamService ~ sendJoinRequest ~ existingPlayer:", existingPlayer)
        throw HttpException.notFound('You are already in a team.');
      }
  
      // Check for existing pending request
      const existingRequest = await prisma.teamJoinRequest.findFirst({
        where: {
          team_id: parsedTeamId,
          user_id: parsedUserId,
          status: 'PENDING',
        },
      });
      console.log("🚀 ~ TeamService ~ sendJoinRequest ~ existingRequest:", existingRequest)
      console.log("🚀 ~ TeamService ~ sendJoinRequest ~ existingRequest:", existingRequest)
      if (existingRequest) {
        console.log("🚀 ~ TeamService ~ sendJoinRequest ~ existingRequest:", existingRequest)
        throw HttpException.conflict('Request already sent, wait for the decision...');
      }
  
      // Get user and team details for notification
      const [user, team] = await Promise.all([
        prisma.user.findUnique({
          where: {id: parsedUserId},
          select: {username: true},
        }),
        prisma.teams.findUnique({
          where: {id: parsedTeamId},
          select: {team_name: true},
        }),
      ]);
  
      if (!user || !team) {
        throw HttpException.notFound('User or team not found.');
      }
  console.log('ya saman')
      // Create the request
      const request = await prisma.teamJoinRequest.create({
        data: {
          team_id: parsedTeamId,
          user_id: parsedUserId,
          status: 'PENDING',
        },
      });
      console.log("🚀 ~ TeamService ~ sendJoinRequest ~ request:", request)
  
      // Get the team leader's user ID
      const teamLeader = await prisma.teamPlayers.findFirst({
        where: {
          team_id: parsedTeamId,
          role: 'TEAM_LEADER',
        },
      });
      if (!teamLeader) {
        throw HttpException.notFound('Team leader not found.');
      }

  console.log('pugo')
  console.log(teams)
      return teams;
    }
      catch (error: any) {
        this.changeTeamLeader
        console.log('ya po aayo:')
        console.error(error); // Always log it for server debugging
        
        // If it's already an HttpException, throw it again
        if (error instanceof HttpException) {
          throw new Error(error.message); // GraphQL expects a normal Error with a message
        }
        
        // If it's something else, throw a generic error
        throw new Error('An unexpected error occurred.');
      }
    
  } 
  async acceptRequest(leaderUserId: string, requestId: string) {
    return await prisma.$transaction(async (prisma) => {
      const parsedLeaderId = parseInt(leaderUserId);
      const parsedRequestId = parseInt(requestId);

      const request = await prisma.teamJoinRequest.findUnique({
        where: {id: parsedRequestId},
        include: {team: true, user: true},
      });
      if (!request || request.status !== 'PENDING') {
        throw HttpException.notFound('Request not found or already processed.');
      }

      // Verify the requester is the team leader
      const isLeader = await prisma.teamPlayers.findFirst({
        where: {
          team_id: request.team_id,
          user_id: parsedLeaderId,
          role: 'TEAM_LEADER',
        },
      });
      if (!isLeader) {
        throw HttpException.forbidden('Only the team leader can accept requests.');
      }

      // Check if team is full
      const team = await prisma.teams.findUnique({
        where: {id: request.team_id},
        include: {teamPlayers: true},
      });
      if (!team) throw HttpException.notFound('Team not found.');
      if (team.teamPlayers.length >= team.max_players) {
        throw HttpException.internalServerError('The team is full.');
      }

      // Add the player to the team
      await prisma.teamPlayers.create({
        data: {
          team_id: request.team_id,
          user_id: request.user_id,
          role: 'PLAYER',
        },
      });

      // Update request status to ACCEPTED
      await prisma.teamJoinRequest.update({
        where: {id: parsedRequestId},
        data: {status: 'ACCEPTED'},
      });

      // // Create notification for the player
      // await prisma.notification.create({
      //   data: {
      //     message: `Your request to join team ${team.team_name} has been accepted.`,
      //     sender: parsedLeaderId,
      //     receiver: request.user_id,
      //     links: `/team/${request.team_id}`,
      //   },
      // });

      return 'Request accepted. Player added to the team.';

    });
  }
 
  async rejectRequest(leaderUserId: string, requestId: string) {
    return await prisma.$transaction(async (prisma) => {
      const parsedLeaderId = parseInt(leaderUserId);
      const parsedRequestId = parseInt(requestId);

      const request = await prisma.teamJoinRequest.findUnique({
        where: {id: parsedRequestId},
        include: {team: true, user: true},
      });
      if (!request || request.status !== 'PENDING') {
        throw HttpException.notFound('Request not found or already processed.');
      }

      // Verify the requester is the team leader
      const isLeader = await prisma.teamPlayers.findFirst({
        where: {
          team_id: request.team_id,
          user_id: parsedLeaderId,
          role: 'TEAM_LEADER',
        },
      });
      if (!isLeader) {
        throw HttpException.unauthorized('Only the team leader can reject requests.');
      }

      // Update request status to REJECTED
      await prisma.teamJoinRequest.update({
        where: {id: parsedRequestId},
        data: {status: 'REJECTED'},
      });

      // // Create notification for the player
      // await prisma.notification.create({
      //   data: {
      //     message: `Your request to join team ${request.team.team_name} has been rejected.`,
      //     sender: parsedLeaderId,
      //     receiver: request.user_id,
      //     links: `/team/${request.team_id}`,
      //   },
      // });

      return {message: 'Request rejected.'};
    });
  }
 
  async getPendingRequests(userId: string) {
    const teamDetails = await prisma.teams.findFirst({
      where: {
        OR: [
          {
            teamPlayers: {
              some: {
                user_id: Number(userId),
              },
            },
          },
        ],
      },
      include: {
        teamPlayers: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            role: true,
          },
        },
      },
    });
    const parsedTeamId = teamDetails?.id;
    const parsedUserId = parseInt(userId);

    // Verify the user is the team leader
    const isLeader = await prisma.teamPlayers.findFirst({
      where: {
        team_id: parsedTeamId,
        user_id: parsedUserId,
        role: 'TEAM_LEADER',
      },
    });
    if (!isLeader) {
      throw HttpException.notFound('Only the team leader can view pending requests.');
    }

    // Retrieve pending requests
    const requests = await prisma.teamJoinRequest.findMany({
      where: {
        team_id: parsedTeamId,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
    return requests;
  }
  async addTeamMedia( mediaUrl: string, type: string, userId: number) {

    const teamId= await prisma.teamPlayers.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        team_id: true,
      },
    });
    try {
      const newMedia = await prisma.team_media.create({
        data: {
          team_id: teamId?.team_id!,
          media_url: mediaUrl,
          type,
          user_id: userId,
        },
      });
      return newMedia;
    } catch (error) {
      throw  HttpException.internalServerError('Failed to add media');
    }
  }
  async getTeamMedia(userId: number) {
    const teamId = await prisma.teamPlayers.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        team_id: true,
      },
    });
    try {
      //display according to the createdAt date
      const media = await prisma.team_media.findMany({
        where: {
          team_id: teamId?.team_id!,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return media;
    } catch (error) {
      throw HttpException.internalServerError('Failed to fetch media');
    }
  }
  async getAllTeams(){
    try {
      const teams = await prisma.teams.findMany({
        include: {
          teamPlayers: {
            include: {
              user: {
                select: {
                  id:true,
                  role:true,
                  username: true,
                  email: true
                }
              }
            }
          }
        }
      });
      return teams;
    } catch (error) {
      throw HttpException.internalServerError('Failed to fetch all teams');
    }
  }
   async leaveTeam(userId: string) {
    const uid = parseInt(userId, 10);

    // find their team-membership row
    const membership = await prisma.teamPlayers.findFirst({
      where: { user_id: uid },
    });
    if (!membership) {
      throw HttpException.notFound('You are not a member of any team.');
    }

    // team-leaders can’t simply “leave” (must transfer or delete)
    if (membership.role === 'TEAM_LEADER') {
      throw HttpException.badRequest(
        'Team leaders cannot leave their own team. Transfer leadership or delete the team first.'
      );
    }

    // delete that row
    await prisma.teamPlayers.delete({
      where: { id: membership.id },
    });

    return { message: 'You have successfully left the team.' };
  }
  async updateTeam(id:string,team_name:string,max_players:string,description:string,team_icon:string){
    const parsedTeamId = parseInt(id);
    console.log("🚀 ~ TeamService ~ updateTeam ~ parsedTeamId:", parsedTeamId)
    const parsedMaxPlayers = parseInt(max_players);
    console.log("🚀 ~ TeamService ~ updateTeam ~ parsedMaxPlayers:", parsedMaxPlayers)
    try {
      const updatedTeam = await prisma.teams.update({
        where: { id: parsedTeamId },
        data: {
          team_name,
          max_players: parsedMaxPlayers,
          description,
          logo: team_icon,
        },
      });
      console.log("🚀 ~ TeamService ~ updateTeam ~ updatedTeam:", updatedTeam)
      return updatedTeam;
    } catch (error) {
      console.log("🚀 ~ TeamService ~ updateTeam ~ error:", error)
      throw HttpException.internalServerError('Failed to update team');
    }
  }
}
export default new TeamService();
