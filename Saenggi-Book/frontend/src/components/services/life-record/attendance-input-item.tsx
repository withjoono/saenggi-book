import { Input } from "@/components/ui/input";
import { ISchoolRecordAttendance } from "@/stores/server/features/me/interfaces";
import React from "react";

export const AttendanceInputItem = React.memo(
  ({
    attendanceItem,
    onChangeAttendanceValue,
  }: {
    attendanceItem?: Omit<ISchoolRecordAttendance, "id"> | null;
    onChangeAttendanceValue: (type: string, value: string) => void;
  }) => {
    return (
      <div className="flex items-center space-x-2">
        <Input
          className="min-w-[80px] max-w-[80px]"
          placeholder="학년"
          type="text"
          value={attendanceItem?.grade || "0"}
          disabled
        />
        <Input
          className="min-w-[80px] max-w-[80px]"
          placeholder="수업일수"
          type="text"
          onChange={(e) =>
            onChangeAttendanceValue("class_days", e.target.value)
          }
          value={attendanceItem?.class_days || "0"}
        />
        <div className="wf-ull flex min-w-[180px] max-w-[180px] items-center justify-around gap-2">
          <Input
            className="w-full"
            type="text"
            onChange={(e) =>
              onChangeAttendanceValue("absent_disease", e.target.value)
            }
            value={attendanceItem?.absent_disease || "0"}
          />
          <Input
            className="w-full"
            type="text"
            onChange={(e) =>
              onChangeAttendanceValue("absent_unrecognized", e.target.value)
            }
            value={attendanceItem?.absent_unrecognized || "0"}
          />
          <Input
            className="w-full"
            type="text"
            onChange={(e) =>
              onChangeAttendanceValue("absent_etc", e.target.value)
            }
            value={attendanceItem?.absent_etc || "0"}
          />
        </div>
        <div className="wf-ull flex min-w-[180px] max-w-[180px] items-center justify-around gap-2">
          <Input
            className="w-full"
            type="text"
            onChange={(e) =>
              onChangeAttendanceValue("late_disease", e.target.value)
            }
            value={attendanceItem?.late_disease || "0"}
          />
          <Input
            className="w-full"
            type="text"
            onChange={(e) =>
              onChangeAttendanceValue("late_unrecognized", e.target.value)
            }
            value={attendanceItem?.late_unrecognized || "0"}
          />
          <Input
            className="w-full"
            type="text"
            onChange={(e) =>
              onChangeAttendanceValue("late_etc", e.target.value)
            }
            value={attendanceItem?.late_etc || "0"}
          />
        </div>

        <div className="wf-ull flex min-w-[180px] max-w-[180px] items-center justify-around gap-2">
          <Input
            className="w-full"
            type="text"
            onChange={(e) =>
              onChangeAttendanceValue("leave_early_disease", e.target.value)
            }
            value={attendanceItem?.leave_early_disease || "0"}
          />
          <Input
            className="w-full"
            type="text"
            onChange={(e) =>
              onChangeAttendanceValue(
                "leave_early_unrecognized",
                e.target.value,
              )
            }
            value={attendanceItem?.leave_early_unrecognized || "0"}
          />
          <Input
            className="w-full"
            type="text"
            onChange={(e) =>
              onChangeAttendanceValue("leave_early_etc", e.target.value)
            }
            value={attendanceItem?.leave_early_etc || "0"}
          />
        </div>
        <div className="wf-ull flex min-w-[180px] max-w-[180px] items-center justify-around gap-2">
          <Input
            className="w-full"
            type="text"
            onChange={(e) =>
              onChangeAttendanceValue("result_disease", e.target.value)
            }
            value={attendanceItem?.result_disease || "0"}
          />
          <Input
            className="w-full"
            type="text"
            onChange={(e) =>
              onChangeAttendanceValue("result_unrecognized", e.target.value)
            }
            value={attendanceItem?.result_unrecognized || "0"}
          />
          <Input
            className="w-full"
            type="text"
            onChange={(e) =>
              onChangeAttendanceValue("result_early_etc", e.target.value)
            }
            value={attendanceItem?.result_early_etc || "0"}
          />
        </div>
      </div>
    );
  },
);
