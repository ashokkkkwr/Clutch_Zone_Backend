import HttpException from '../utils/HttpException.utils';
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

class TeamService {
  /** 
   * Create team code
  */
  async createTeam(
    team_name: string,
    max_players: string,
    slug: string,
    team_icon: string,
    user_id: string,
  ) {
    try {
      const ifUserAlreadyOnTeam = await prisma.team_players.findFirst({
        where: {
          user_id: Number(user_id),
        },
      });
      if (ifUserAlreadyOnTeam) {
        throw HttpException.badRequest(
          `You are already on a team please leave a team to create a new one.`,
        );
      }
      const saved = await prisma.teams.create({
        data: {
          team_name,
          max_players: parseInt(max_players),
          slug,
          logo: team_icon,
          // team_leader_id: parseInt(user_id),
        },
      });
      const assignLeader = await prisma.team_players.create({
        data: {
          team_id: saved.id,
          user_id: parseInt(user_id),
          role: 'TEAM_LEADER',
        },
      });
      return saved;
    } catch (error) {
      console.log('🚀 ~ TeamService ~ createTeam ~ error:', error);
    }
  }
  /** 
   * Get all team code
  */
  async getTeam() {
    const getAllTeams = await prisma.teams.findMany({
      include: {
        //  team_leader:true,
        team_players: true,
      },
    });

    console.log('🚀 ~ TeamService ~ getTeam ~ getAllTeams:', getAllTeams);
    return getAllTeams;
  }
  /** 
   * Get own team details code
  */

  async getOwnTeamDetails(id: string) {
    try {
      
      const userId = parseInt(id);
      console.log("🚀 ~ TeamService ~ getOwnTeamDetails ~ userId:", userId)

      const teamDetails = await prisma.teams.findFirst({
        where: {
          OR: [
            {
              team_players: {
                some: {
                  user_id: userId, },
              },
            },
          ],
        },
        include: {
         
          team_players: {
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
      console.log('hahaa-asd-s-dsa-d-sa', teamDetails);

      if (!teamDetails) {
        return {message: 'No team found for this user'};
      }

      return teamDetails;
    } catch (error) {
      console.error('Error fetching team details:', error);
      throw new Error('An error occurred while fetching the team details.');
    }
  }
  /** 
   * COde to delete team
  */
  async deleteTeam(teamId: string, userId: string) {
    const teamLeader = await prisma.team_players.findFirst({
      where: {
        team_id: parseInt(teamId),
        user_id: parseInt(userId),
        role: 'TEAM_LEADER',
      },
    });
    if (!teamLeader) {
      throw HttpException.forbidden('only the team leader can delete the team.');
    }
    const deletedTeam = await prisma.teams.delete({
      where: {
        id: parseInt(teamId),
      },
    });
    return deletedTeam;
  }
  /** 
   * Code to add player
  */
  async addPlayer(teamId: string, userId: string, newPlayerId: string) {
    const teamLeader = await prisma.team_players.findFirst({
      where: {
        team_id: parseInt(teamId),
        user_id: parseInt(userId),
        role: 'TEAM_LEADER',
      },
    });
    if (!teamLeader) {
      throw HttpException.forbidden('Only the team leader can add players.');
    }
    const existingPlayer = await prisma.team_players.findFirst({
      where: {user_id: parseInt(newPlayerId)},
    });
    if (existingPlayer) {
      throw HttpException.badRequest('The user is already part of the another team.');
    }
    const team = await prisma.teams.findUnique({
      where: {
        id: parseInt(teamId),
      },
      include: {team_players: true},
    });
    if (!team) {
      throw HttpException.notFound('Team not found.');
    }
    if (team.team_players.length >= team.max_players) {
      throw HttpException.badRequest('The team has reached the maximum number of players.');
    }
    const newPlayer = await prisma.team_players.create({
      data: {
        team_id: parseInt(teamId),
        user_id: parseInt(newPlayerId),
        role: 'PLAYER',
      },
    });
    return newPlayer;
  }
  /** 
   * Code to remove player
  */
  async removePlayer(teamId:string,userId:string,playerIdToRemove:string){
    const currentUserRole = await prisma.team_players.findFirst({
      where: {
          team_id: parseInt(teamId),
          user_id: parseInt(userId)
      },
      select: { role: true }
  });
  if (!currentUserRole) {
      throw HttpException.forbidden('You are not part of this team.');
  }

  if (currentUserRole.role !== 'TEAM_LEADER' && parseInt(userId) !== parseInt(playerIdToRemove)) {
      throw HttpException.forbidden('You can only remove yourself from the team.');
  }

  const playerToRemove = await prisma.team_players.findFirst({
      where: {
          team_id: parseInt(teamId),
          user_id: parseInt(playerIdToRemove)
      }
  });
  if(!playerToRemove){
    throw HttpException.notFound('player to remove not found.')
  }
  if (playerToRemove.role === 'TEAM_LEADER') {
      throw HttpException.badRequest('Cannot remove the team leader. Transfer leadership first.');
  }

  const removedPlayer = await prisma.team_players.delete({
      where: { id: playerToRemove.id }
  });
  return removedPlayer;
  }
  /** 
   * Code to change the team leader
  */
  async changeTeamLeader(teamId: string, userId: string, newLeaderId: string) {
    const currentLeader = await prisma.team_players.findFirst({
        where: {
            team_id: parseInt(teamId),
            user_id: parseInt(userId),
            role: 'TEAM_LEADER'
        }
    });
    if (!currentLeader) {
        throw HttpException.forbidden('Only the current team leader can transfer leadership.');
    }

    const newLeader = await prisma.team_players.findFirst({
        where: {
            team_id: parseInt(teamId),
            user_id: parseInt(newLeaderId)
        }
    });
    if (!newLeader) {
        throw HttpException.badRequest('The new leader must be a member of the team.');
    }

    await prisma.team_players.update({
        where: { id: currentLeader.id },
        data: { role: 'PLAYER' }
    });

    const updatedNewLeader = await prisma.team_players.update({
        where: { id: newLeader.id },
        data: { role: 'TEAM_LEADER' }
    });
    return updatedNewLeader;
}
/** 
   * Code to get team by id
  */
async getTeamById(teamId: string) {
  const team = await prisma.teams.findUnique({
      where: { id: parseInt(teamId) },
      include: {
          team_players: {
              include: {
                  user: {
                      select: {
                          id: true,
                          username: true,
                          email: true,
                          avatar: true
                      }
                  }
              }
          }
      }
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
      where: { id: parseInt(teamId) },
      include: { team_players: true }
  });
  if(!team){
    throw HttpException.notFound('Team not found')
  }
  return team.team_players.length >= team.max_players;
}
  /**
   * Send a request to join a team
   */
  async sendJoinRequest(userId: string, teamId: string) {
    const parsedUserId = parseInt(userId);
    const parsedTeamId = parseInt(teamId);

    // Check if user is already in a team
    const existingPlayer = await prisma.team_players.findFirst({
      where: { user_id: parsedUserId }
    });
    if (existingPlayer) {
      throw  HttpException.notFound('You are already in a team.');
    }

    // Check for existing pending request
    const existingRequest = await prisma.teamJoinRequest.findFirst({
      where: {
        team_id: parsedTeamId,
        user_id: parsedUserId,
        status: 'PENDING'
      }
    });
    if (existingRequest) {
      throw  HttpException.notFound( 'A pending request already exists.');
    }

    // Get user and team details for notification
    const [user, team] = await Promise.all([
      prisma.user.findUnique({
        where: { id: parsedUserId },
        select: { username: true }
      }),
      prisma.teams.findUnique({
        where: { id: parsedTeamId },
        select: { team_name: true }
      })
    ]);

    if (!user || !team) {
      throw  HttpException.notFound('User or team not found.');
    }

    // Create the request
    const request = await prisma.teamJoinRequest.create({
      data: {
        team_id: parsedTeamId,
        user_id: parsedUserId,
        status: 'PENDING'
      }
    });

    // Get the team leader's user ID
    const teamLeader = await prisma.team_players.findFirst({
      where: {
        team_id: parsedTeamId,
        role: 'TEAM_LEADER'
      }
    });
    if (!teamLeader) {
      throw  HttpException.notFound( 'Team leader not found.');
    }

    // Create notification for the leader
    await prisma.notification.create({
      data: {
        message: `User ${user.username} has requested to join your team ${team.team_name}.`,
        sender: parsedUserId,
        receiver: teamLeader.user_id,
        links: `/team/${parsedTeamId}/requests`
      }
    });

    return team;
  }
   /**
   * Accept a join request (Team Leader Only)
   */
   async acceptRequest(leaderUserId: string, requestId: string) {
    return await prisma.$transaction(async (prisma) => {
      
      const parsedLeaderId = parseInt(leaderUserId);
      const parsedRequestId = parseInt(requestId);

      const request = await prisma.teamJoinRequest.findUnique({
        where: { id: parsedRequestId },
        include: { team: true, user: true }
      });
      if (!request || request.status !== 'PENDING') {
        throw  HttpException.notFound('Request not found or already processed.');
      }

      // Verify the requester is the team leader
      const isLeader = await prisma.team_players.findFirst({
        where: {
          team_id: request.team_id,
          user_id: parsedLeaderId,
          role: 'TEAM_LEADER'
        }
      });
      if (!isLeader) {
        throw  HttpException.forbidden( 'Only the team leader can accept requests.');
      }

      // Check if team is full
      const team = await prisma.teams.findUnique({
        where: { id: request.team_id },
        include: { team_players: true }
      });
      if (!team) throw  HttpException.notFound( 'Team not found.');
      if (team.team_players.length >= team.max_players) {
        throw  HttpException.internalServerError( 'The team is full.');
      }

      // Add the player to the team
      await prisma.team_players.create({
        data: {
          team_id: request.team_id,
          user_id: request.user_id,
          role: 'PLAYER'
        }
      });

      // Update request status to ACCEPTED
      await prisma.teamJoinRequest.update({
        where: { id: parsedRequestId },
        data: { status: 'ACCEPTED' }
      });

      // Create notification for the player
      await prisma.notification.create({
        data: {
          message: `Your request to join team ${team.team_name} has been accepted.`,
          sender: parsedLeaderId,
          receiver: request.user_id,
          links: `/team/${request.team_id}`
        }
      });

      return { message: 'Request accepted. Player added to the team.' };
    });
  }
/**
   * Reject a join request (Team Leader Only)
   */
async rejectRequest(leaderUserId: string, requestId: string) {
  return await prisma.$transaction(async (prisma) => {
    const parsedLeaderId = parseInt(leaderUserId);
    const parsedRequestId = parseInt(requestId);

    const request = await prisma.teamJoinRequest.findUnique({
      where: { id: parsedRequestId },
      include: { team: true, user: true }
    });
    if (!request || request.status !== 'PENDING') {
      throw  HttpException.notFound( 'Request not found or already processed.');
    }

    // Verify the requester is the team leader
    const isLeader = await prisma.team_players.findFirst({
      where: {
        team_id: request.team_id,
        user_id: parsedLeaderId,
        role: 'TEAM_LEADER'
      }
    });
    if (!isLeader) {
      throw  HttpException.unauthorized( 'Only the team leader can reject requests.');
    }

    // Update request status to REJECTED
    await prisma.teamJoinRequest.update({
      where: { id: parsedRequestId },
      data: { status: 'REJECTED' }
    });

    // Create notification for the player
    await prisma.notification.create({
      data: {
        message: `Your request to join team ${request.team.team_name} has been rejected.`,
        sender: parsedLeaderId,
        receiver: request.user_id,
        links: `/team/${request.team_id}`
      }
    });

    return { message: 'Request rejected.' };
  });
}
/**
   * Get pending join requests for a team (Team Leader Only)
   */
async getPendingRequests( userId: string) {
  console.log('xit')
  const teamDetails = await prisma.teams.findFirst({
    where: {
      OR: [
        {
          team_players: {
            some: {
              user_id: Number(userId), },
          },
        },
      ],
    },
    include: {
     
      team_players: {
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
  console.log("🚀 ~ TeamService ~ getPendingRequests ~ teamDetails:", teamDetails)
  const parsedTeamId = teamDetails?.id;
  const parsedUserId = parseInt(userId);

  // Verify the user is the team leader
  const isLeader = await prisma.team_players.findFirst({
    where: {
      team_id: parsedTeamId,
      user_id: parsedUserId,
      role: 'TEAM_LEADER'
    }
  });
  console.log("🚀 ~ TeamService ~ getPendingRequests ~ isLeader:", isLeader)
  if (!isLeader) {
    throw  HttpException.notFound( 'Only the team leader can view pending requests.');
  }

  // Retrieve pending requests
  const requests = await prisma.teamJoinRequest.findMany({
    where: {
      team_id: parsedTeamId,
      status: 'PENDING'
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true
        }
      }
    }
  });
  console.log("🚀 ~ TeamService ~ getPendingRequests ~ requests:", requests)

  return requests;
}

}
export default new TeamService();
