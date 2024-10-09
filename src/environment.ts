declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
    }
  }

  namespace App {
    interface Trier {
      success: boolean;
      message: string;
      data: object;
    }
  }
}

export default {};
