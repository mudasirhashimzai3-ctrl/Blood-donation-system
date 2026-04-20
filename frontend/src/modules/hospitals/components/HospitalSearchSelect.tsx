import { Building2, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input, Select } from "@components/ui";
import { useHospital, useHospitalsList } from "../queries/useHospitalQueries";
import HospitalQuickCreateModal from "./HospitalQuickCreateModal";
import { AFGHANISTAN_PROVINCES, type Province } from "../types/hospital.types";

interface HospitalSearchSelectProps {
  value: number;
  onChange: (hospitalId: number) => void;
  error?: string;
}

export default function HospitalSearchSelect({ value, onChange, error }: HospitalSearchSelectProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState<Province | "">("");
  const [isOpen, setIsOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const { data } = useHospitalsList(
    {
      page_size: 10,
      province: province || undefined,
      search: search || undefined,
      is_active: true,
    },
    { enabled: Boolean(province) && (isOpen || search.length > 0) }
  );

  const { data: selectedHospital } = useHospital(value, { enabled: value > 0 });

  const hospitals = data?.results ?? [];
  const selectedProvince = selectedHospital?.province ?? "";

  useEffect(() => {
    if (!province && selectedProvince) {
      setProvince(selectedProvince);
    }
  }, [province, selectedProvince]);

  const inputValue = useMemo(() => {
    if (search) return search;
    if (selectedHospital) return selectedHospital.name;
    return "";
  }, [search, selectedHospital]);

  return (
    <div className="relative space-y-2">
      <Select
        label={t("hospitals.form.province", "Province")}
        value={province}
        onChange={(event) => {
          const nextProvince = event.target.value as Province | "";
          setProvince(nextProvince);
          setSearch("");
          onChange(0);
          setIsOpen(false);
        }}
        options={[
          { value: "", label: t("hospitals.filters.provincePlaceholder", "Select province") },
          ...AFGHANISTAN_PROVINCES.map((value) => ({ value, label: value })),
        ]}
      />

      <Input
        label={t("recipients.form.hospitalName", "Hospital Name")}
        placeholder={province ? t("recipients.form.hospitalSearchPlaceholder", "Search hospital") : t("hospitals.filters.selectProvinceFirst", "Select province first")}
        value={inputValue}
        onFocus={() => {
          if (province) {
            setIsOpen(true);
          }
        }}
        onChange={(event) => {
          if (!province) return;
          setSearch(event.target.value);
          setIsOpen(true);
        }}
        leftIcon={<Search className="h-4 w-4" />}
        error={error}
        disabled={!province}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsQuickCreateOpen(true)}
          disabled={!province}
        >
          {t("hospitals.quickCreate.action", "Quick Create Hospital")}
        </Button>
      </div>

      {isOpen && province ? (
        <div className="absolute left-0 right-0 top-[152px] z-20 max-h-72 overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
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
                      {hospital.province} {hospital.phone ? `- ${hospital.phone}` : ""}
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
        province={province}
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
