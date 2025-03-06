export const authenticateUser = (context: any): string => {
  
    if (!context.user || !context.user.id) {
      console.error("🚀 ~ authenticateUser ~ context.user:", context.user);
    }
  
    return context.user.id;
  };
  