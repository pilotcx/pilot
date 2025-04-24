import {TeamNewsfeed} from "@/app/(org)/t/[teamSlug]/components/newsfeed";

export default async function TeamPage({params}: { params: any }) {
  return (
    <div className="container max-w-3xl mx-auto px-8">
      <TeamNewsfeed/>
    </div>
  );
}
