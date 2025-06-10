import { ActivityCalendar } from "@/components/activity-calendar";

export default function ActivitiesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Family Activities</h1>
        <p className="text-gray-600 mt-1">Manage and schedule activities for all family members.</p>
      </div>
      
      <ActivityCalendar />
    </div>
  );
}
