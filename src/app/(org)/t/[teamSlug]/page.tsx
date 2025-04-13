import withTeam from "@/lib/utils/withTeam";
import {TeamNewsfeed} from "@/app/(org)/t/[teamSlug]/components/newsfeed";

export default async function TeamPage({params}: { params: any }) {
  const {team} = await withTeam((await params).teamSlug);

  return (
    <div className="container max-w-3xl mx-auto">
      <TeamNewsfeed/>
    </div>
  );
}
