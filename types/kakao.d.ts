declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Channel: {
        chat: (options: { channelPublicId: string }) => void;
        createAddChannelButton: (options: {
          container: string;
          channelPublicId: string;
        }) => void;
      };
    };
  }
}

export {};
