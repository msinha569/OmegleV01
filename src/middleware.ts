import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isPublicPath = path === "/login" || path === "/verifyemail" || path === "/signup"
    const token = request.cookies.get("token")

    if (isPublicPath && token){
        return NextResponse.redirect(new URL('/profile', request.url))
    }else if (!isPublicPath && !token){
        return NextResponse.redirect(new URL('/signup', request.url))
    }
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/signup',
    '/login',
    '/verifyemail',
    '/profile',
    '/login/forgotpassword'
  ]
}