import { origin } from "../config.js";
import { ControlPanel } from "../components/pages/ControlPanel.js";
import { fetcher } from "../lib/fetcher.js";

//import { Room } from "../lib/Room.js"; // Add this line

export default ControlPanel;

// Function to fetch room data from the server-side database
/* export async function getRoomDataById(id) {
  try {
    const res = await fetcher.get(`/api/room/${id}`, {
      retry: false,
    });
    if (res.ok) {
      const roomData = await res.json();
      return roomData;
    } else {
      throw new Error("Failed to fetch room data");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch room data");
  }
} */

/*
    Notes: In Next.js, getServerSideProps is a function that is used to fetch data on the server-side during every request.
    This function runs on the server and not in the browser, and it allows you to pre-render pages with data that is fetched
    dynamically from external APIs or databases.

    This makes it perfect place to call our server-side database to fetch the data you need to pre-render a file to catch for expired files.

    Context.params: If this page uses a dynamic route, params contains the route parameters.
    If the page name is [id].js , then params will look like { id: ... }.
    */

// Sends Room ID to Room component to process and render file download page for given ID
// Initiating Room from ID 1.

// Note: Likely need to get room data from database as opposed to local client storage.
// This is becasue a user outside of the client's browser will not have access to the client's local storage.
// Hence the name "server-side props" or properties.

export async function getServerSideProps(context) {
  try {
    console.log("[roomid] | context.params: ", context.params);
    const roomId = context.params?.roomid || null;

    if (!roomId) {
      console.error("No room ID present");
      return {
        notFound: true,
      };
    }
    if (roomId !== "files" && roomId !== "top-up") {
      // Get room data from the server-side database using the imported function
      // call the server-side database to retrieve expiresAtTimestampMs and remainingDownloads

      console.log(`Lets go: ${origin}/api/room/${roomId}`);

      /*       const room = await fetcher.get(`${origin}/api/room/${roomId}`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        retry: false,
      });
 */
      //console.log("[roomid] | res: ", room);

      /* if (!room) {
        throw new Error("Failed to fetch room data");
      } else { */
      // Check if the room is expired
      /*         const isExpired =
          (room !== null &&
            new Date(room.expiresAtTimestampMs).getTime() < Date.now()) ||
          (room !== null && room.remainingDownloads === 0);

        if (isExpired) {
          return {
            notFound: true,
          };
        } */

      /*         return {
          props: {
            socialImage: `${origin}/images/social-share-file.jpg`, */
      /* room.multiFile
            ? `${origin}/images/social-share-files.jpg`
            : `${origin}/images/social-share-file.jpg`, */
      /*             id: roomId,
            //isExpired: isExpired,
          },
        };
      } */
    }
  } catch (error) {
    console.error(error);
    return {
      notFound: true,
    };
  }

  // Add default return statement
  return {
    props: {},
  };
}

// Note: You can customize the error handling in the above function to fit your specific use case.
