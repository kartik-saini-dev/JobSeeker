export const fetchUserInfo = async (userId) => {
    try {
      const response = await fetch(`http:localhost:3000/api/users/?userId=${userId}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
        cache: "no-store",
      });
  
      const data = await response.json();
  
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  
  