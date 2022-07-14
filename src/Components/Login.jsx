import React from 'react'

export default function Login() {
    const GoogleAuth = (e) => {
        e.preventDefault();
        window.open(`http://localhost:5000/api/auth/google`, '_self');
      }
  return (
    <div>
        <button class="btn btn-outline-success" type="submit"    onClick={GoogleAuth}>Login</button>
    </div>
  )
}
