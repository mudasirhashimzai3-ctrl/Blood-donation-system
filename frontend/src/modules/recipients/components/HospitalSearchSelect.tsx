import { Building2, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@components/ui";
import { useHospital, useHospitalsList } from "../queries/useHospitalQueries";
import HospitalQuickCreateModal from "./HospitalQuickCreateModal";

interface HospitalSearchSelectProps {
  value: number;
  onChange: (hospitalId: number) => void;
  error?: string;
}

export default function HospitalSearchSelect({ value, onChange, error }: HospitalSearchSelectProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const { data } = useHospitalsList(
    {
      page_size: 10,
      search: search || undefined,
    },
    { enabled: isOpen || search.length > 0 }
  );

  const { data: selectedHospital } = useHospital(value, { enabled: value > 0 });

  const hospitals = data?.results ?? [];
  const inputValue = useMemo(() => {
    if (search) return search;
    if (selectedHospital) return selectedHospital.name;
    return "";
  }, [search, selectedHospital]);

  return (
    <div className="relative space-y-2">
      <Input
        label={t("recipients.form.hospitalName", "Hospital Name")}
        placeholder={t("recipients.form.hospitalSearchPlaceholder", "Search hospital")}
        value={inputValue}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setSearch(event.target.value);
          setIsOpen(true);
        }}
        leftIcon={<Search className="h-4 w-4" />}
        error={error}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsQuickCreateOpen(true)}
        >
          {t("hospitals.quickCreate.action", "Quick Create Hospital")}
        </Button>
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[72px] z-20 max-h-72 overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
          {hospitals.length === 0 ? (
            <p className="p-4 text-sm text-text-secondary">
              {t("hospitals.search.empty", "No hospitals found")}
            </p>
          ) : (
            hospitals.map((hospital) => (
              <button
                key={hospital.id}
                type="button"
                className="flex w-full items-center justify-between gap-2 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-surface-hover"
                onClick={() => {
                  onChange(hospital.id);
                  setSearch("");
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-text-secondary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{hospital.name}</p>
                    <p className="text-xs text-text-secondary">
                      {hospital.city} {hospital.contact_phone ? `- ${hospital.contact_phone}` : ""}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      ) : null}

      <HospitalQuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onCreated={(hospital) => {
          onChange(hospital.id);
          setSearch("");
          setIsQuickCreateOpen(false);
          setIsOpen(false);
        }}
      />
    </div>
  );
}

