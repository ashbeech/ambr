import YouTube from "react-youtube";

const VideoPlayer = ({ videoId }) => {
  const opts = {
    height: 360,
    width: "100%",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
      hd: 1,
    },
  };

  return <YouTube videoId={videoId} opts={opts} />;
};

export default VideoPlayer;
