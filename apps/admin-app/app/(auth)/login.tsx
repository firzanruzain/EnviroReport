import { signIn as SignIn } from "modules";

export default function login() {
  return SignIn({ enableNotificationPrompt: true });
}
