"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Feed from '@/components/hives/feed';

export default function HivePage() {
  const params = useParams();
  const paths = Array.isArray(params.hives) ? params.hives : [params.hives];
  const communityId = paths[0]; // First segment is the community name
  const subPath = paths.length > 1 ? paths.slice(1).join('/') : null; // Additional path segments if any

  // Validate that we have a community name
  if (!communityId) {
    return <div>Invalid community URL</div>;
  }

  return (
    <Feed communityId={communityId} subPath={subPath} />
  );
}