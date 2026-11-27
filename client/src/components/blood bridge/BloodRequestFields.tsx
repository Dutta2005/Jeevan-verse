import { useMemo, type ReactNode } from "react";
import { State, City } from "country-state-city";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { bloodGroups, type RequestDraft } from "./blood-request-form";
import styles from "./BloodBridge.module.css";

const states = State.getStatesOfCountry("IN");
function RequestField({
  name,
  label,
  error,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={`request-${name}`}>{label}</FieldLabel>
      {children}
      {error && <FieldError id={`request-${name}-error`}>{error}</FieldError>}
    </Field>
  );
}
export default function BloodRequestFields({
  data,
  errors,
  onChange,
  disabled,
}: {
  data: RequestDraft;
  errors: Record<string, string>;
  onChange: (name: keyof RequestDraft, value: string) => void;
  disabled: boolean;
}) {
  const stateCode = states.find((state) => state.name === data.state)?.isoCode || "";
  const cities = useMemo(() => City.getCitiesOfState("IN", stateCode) || [], [stateCode]);
  const control = (name: keyof RequestDraft) => ({
    id: `request-${name}`,
    disabled,
    "aria-required": name !== "message" && name !== "email",
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `request-${name}-error` : undefined,
  });
  return (
    <FieldGroup>
      <FieldSet disabled={disabled}>
        <FieldLegend>Blood needed</FieldLegend>
        <div className={styles.fieldColumns}>
          <RequestField name="bloodGroup" label="Blood group *" error={errors.bloodGroup}>
            <Select
              value={data.bloodGroup}
              onValueChange={(value) => onChange("bloodGroup", value)}
              disabled={disabled}
            >
              <SelectTrigger {...control("bloodGroup")}>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </RequestField>
          <RequestField name="urgency" label="Urgency *" error={errors.urgency}>
            <Select
              value={data.urgency}
              onValueChange={(value) => onChange("urgency", value)}
              disabled={disabled}
            >
              <SelectTrigger {...control("urgency")}>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {["low", "medium", "high"].map((level) => (
                    <SelectItem key={level} value={level}>
                      {level[0].toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </RequestField>
        </div>
      </FieldSet>
      <FieldSet disabled={disabled}>
        <FieldLegend>Location</FieldLegend>
        <RequestField name="state" label="State *" error={errors.state}>
          <Select
            value={stateCode}
            onValueChange={(code) =>
              onChange("state", states.find((state) => state.isoCode === code)?.name || "")
            }
            disabled={disabled}
          >
            <SelectTrigger {...control("state")}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {states.map((state) => (
                  <SelectItem key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </RequestField>
        <div className={styles.fieldColumns}>
          <RequestField name="district" label="District *" error={errors.district}>
            <Input
              {...control("district")}
              value={data.district}
              onChange={(event) => onChange("district", event.target.value)}
              autoComplete="address-level2"
            />
          </RequestField>
          <RequestField name="city" label="City / town *" error={errors.city}>
            <Input
              {...control("city")}
              list="request-city-options"
              value={data.city}
              onChange={(event) => onChange("city", event.target.value)}
              placeholder="Enter city or town"
            />
            <datalist id="request-city-options">
              {cities.map((city) => (
                <option key={`${city.name}-${city.latitude}`} value={city.name} />
              ))}
            </datalist>
          </RequestField>
        </div>
      </FieldSet>
      <FieldSet disabled={disabled}>
        <FieldLegend>Contact details</FieldLegend>
        <FieldDescription>
          These details are visible to signed-in members who can view the request.
        </FieldDescription>
        <div className={styles.fieldColumns}>
          <RequestField name="phone" label="Phone *" error={errors.phone}>
            <Input
              {...control("phone")}
              type="tel"
              autoComplete="tel"
              value={data.phone}
              onChange={(event) => onChange("phone", event.target.value)}
            />
          </RequestField>
          <RequestField name="email" label="Email (optional)" error={errors.email}>
            <Input
              {...control("email")}
              type="email"
              autoComplete="email"
              value={data.email}
              onChange={(event) => onChange("email", event.target.value)}
            />
          </RequestField>
        </div>
      </FieldSet>
      <RequestField name="message" label="Message (optional)" error={errors.message}>
        <Textarea
          {...control("message")}
          rows={3}
          placeholder="Hospital, timing, or other useful details"
          value={data.message}
          onChange={(event) => onChange("message", event.target.value)}
        />
      </RequestField>
    </FieldGroup>
  );
}
