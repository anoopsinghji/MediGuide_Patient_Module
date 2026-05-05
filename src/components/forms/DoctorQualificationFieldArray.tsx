import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

export interface QualificationItem {
  degree: string;
  specialization: string;
  university: string;
  year: string;
}

interface QualificationFormValues {
  qualifications: QualificationItem[];
}

interface DoctorQualificationFieldArrayProps {
  value: QualificationItem[];
  onChange: (value: QualificationItem[]) => void;
  onValidityChange: (isValid: boolean) => void;
}

const DEGREE_OPTIONS = ['MBBS', 'MD', 'MS', 'BDS', 'MDS', 'DM', 'MCh', 'BHMS', 'BAMS', 'BUMS', 'DNB'];

const SPECIALIZATION_OPTIONS = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Dermatology',
  'Pediatrics',
  'Neurology',
  'Gynecology',
  'ENT',
  'Ophthalmology',
  'Psychiatry',
  'Pulmonology',
  'Gastroenterology',
  'Urology',
  'Nephrology',
  'Endocrinology',
];

const EMPTY_QUALIFICATION: QualificationItem = {
  degree: '',
  specialization: '',
  university: '',
  year: '',
};

export default function DoctorQualificationFieldArray({
  value,
  onChange,
  onValidityChange,
}: DoctorQualificationFieldArrayProps) {
  const {
    control,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<QualificationFormValues>({
    mode: 'onChange',
    defaultValues: {
      qualifications: value && value.length > 0 ? value : [EMPTY_QUALIFICATION],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'qualifications',
  });

  const watchedQualifications = watch('qualifications');

  useEffect(() => {
    onChange(watchedQualifications || []);
  }, [watchedQualifications, onChange]);

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  useEffect(() => {
    trigger('qualifications');
  }, [trigger]);

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Qualifications *</p>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const rowErrors = errors.qualifications?.[index];

          return (
            <div key={field.id} className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm space-y-4">
              <p className="font-semibold text-gray-800">Qualification {index + 1}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Degree *</label>
                  <Controller
                    name={`qualifications.${index}.degree`}
                    control={control}
                    rules={{ required: 'Degree is required' }}
                    render={({ field: controllerField }) => (
                      <select
                        {...controllerField}
                        className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${
                          rowErrors?.degree ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select degree</option>
                        {DEGREE_OPTIONS.map((degree) => (
                          <option key={degree} value={degree}>
                            {degree}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {rowErrors?.degree?.message ? (
                    <p className="text-red-600 text-xs mt-1">{rowErrors.degree.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
                  <Controller
                    name={`qualifications.${index}.specialization`}
                    control={control}
                    rules={{ required: 'Specialization is required' }}
                    render={({ field: controllerField }) => (
                      <select
                        {...controllerField}
                        className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${
                          rowErrors?.specialization ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select specialization</option>
                        {SPECIALIZATION_OPTIONS.map((specialization) => (
                          <option key={specialization} value={specialization}>
                            {specialization}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {rowErrors?.specialization?.message ? (
                    <p className="text-red-600 text-xs mt-1">{rowErrors.specialization.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">University / College *</label>
                  <Controller
                    name={`qualifications.${index}.university`}
                    control={control}
                    rules={{ required: 'University/College is required' }}
                    render={({ field: controllerField }) => (
                      <input
                        {...controllerField}
                        type="text"
                        placeholder="University / College"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${
                          rowErrors?.university ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    )}
                  />
                  {rowErrors?.university?.message ? (
                    <p className="text-red-600 text-xs mt-1">{rowErrors.university.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year of Completion</label>
                  <Controller
                    name={`qualifications.${index}.year`}
                    control={control}
                    render={({ field: controllerField }) => (
                      <input
                        {...controllerField}
                        type="number"
                        placeholder="e.g. 2018"
                        min={1950}
                        max={new Date().getFullYear()}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                      />
                    )}
                  />
                </div>
              </div>

              {index > 0 ? (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium transition"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}

        <div>
          <button
            type="button"
            onClick={() => append({ ...EMPTY_QUALIFICATION })}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-medium transition"
          >
            + Add Qualification
          </button>
        </div>
      </div>
    </div>
  );
}
