'use client';

import React from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const data = React.use(params);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Profile Page</h1>
      <p>User ID: {data.id}</p>
    </div>
  );
}
