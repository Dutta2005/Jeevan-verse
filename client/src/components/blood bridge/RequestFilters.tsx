import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { bloodGroups } from "./blood-request-form";
import styles from "./BloodBridge.module.css";

export default function RequestFilters({
  bloodGroup,
  status,
  onChange,
  onClear,
}: {
  bloodGroup: string;
  status: string;
  onChange: (name: "bloodGroup" | "status", value: string) => void;
  onClear: () => void;
}) {
  const id = useId();
  return (
    <div className={styles.filterPanel}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${id}-blood`}>Blood group</FieldLabel>
          <Select value={bloodGroup} onValueChange={(value) => onChange("bloodGroup", value)}>
            <SelectTrigger id={`${id}-blood`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All blood groups</SelectItem>
                {bloodGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-status`}>Request status</FieldLabel>
          <Select value={status} onValueChange={(value) => onChange("status", value)}>
            <SelectTrigger id={`${id}-status`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Open</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
      <Button variant="ghost" onClick={onClear} disabled={bloodGroup === "all" && status === "all"}>
        Clear filters
      </Button>
    </div>
  );
}
