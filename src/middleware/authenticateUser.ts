export const authenticateUser = (context: any): string => {
    console.log("🚀 ~ authenticateUser ~ context:", context);
  
    if (!context.user || !context.user.id) {
      console.error("🚀 ~ authenticateUser ~ context.user:", context.user);
    }
  
    console.log("🚀 ~ authenticateUser ~ context.user.id:", context.user.id);
    return context.user.id;
  };
  