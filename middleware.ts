import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin23671361",
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
