import { TrashIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { create } from "zustand";

interface FormState {
  name?: string;
  age?: string;
  gender?: string;
  sexualOrientation?: string;
  zip?: string;
  race?: string;
  servedInMilitary?: string;
  militaryFamily?: string;
  howDidYouHear?: string;
  safetyPlan?: string;
  notes?: string;
  thoughts?: string;
  harmToday?: string;
  plan?: string;
  means?: string;
  timeline?: string;
  sriStart?: string;
  priorThoughts?: string;
  priorAttempts?: string;
  intoxicated?: string;
  gun?: string;
  diagnosis?: string;
  prescription?: string;
  homicidal?: string;
  sriEnd?: string;
}

interface BearState {
  form: FormState;
  updateForm: (form: FormState) => void;
}

function getUrlState(): FormState {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const encoded = urlParams.get("data");
    if (!encoded) {
      return {};
    }
    const decoded = decodeURIComponent(encoded);
    return JSON.parse(decoded) as FormState;
  } catch (e) {
    return {};
  }
}

const useBearStore = create<BearState>((set) => ({
  form: getUrlState(),
  updateForm: (form: FormState) => set((state) => ({ form: { ...state.form, ...form } })),
}));

useBearStore.subscribe((state) => {
  const curForm = JSON.stringify(state.form);
  console.log(curForm);
  const encoded = encodeURIComponent(curForm);
  const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?data=${encoded}`;
  window.history.pushState({ path: newurl }, "", newurl);
});

interface RowData {
  title: string;
  value: string;
}

interface RowTransform {
  title: string;
  value: string;
  isLast: boolean;
  id: number;
  onClick: () => void;
  isSelected: boolean;
}

function useButtonState(): readonly [
  transform: (data: RowData[]) => RowTransform[],
  inputRef: React.RefObject<HTMLInputElement>,
] {
  const [selected, setSelected] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const transform = useCallback(
    (data: { title: string; value: string }[]): RowTransform[] => {
      return data.map(({ title, value }, i) => {
        return {
          title,
          value,
          isLast: i === data.length - 1,
          id: i,
          onClick: () => {
            if (i === selected) {
              setSelected(-1);
              if (inputRef.current) {
                inputRef.current.value = "";
              }
              return;
            }
            setSelected(i);
            if (inputRef.current) {
              inputRef.current.value = title;
            }
          },
          isSelected: i === selected,
        };
      });
    },
    [selected],
  );

  return [transform, inputRef] as const;
}

function useButtonState2(
  onUpdate: (value: string) => void,
): [transform: (data: RowData[]) => RowTransform[], reset: () => void] {
  const [selected, setSelected] = useState<number>(-1);
  const transform = useCallback(
    (data: { title: string; value: string }[]): RowTransform[] => {
      return data.map(({ title, value }, i) => {
        return {
          title,
          value,
          isLast: i === data.length - 1,
          id: i,
          onClick: () => {
            if (i === selected) {
              setSelected(-1);
              onUpdate("");
              return;
            }
            setSelected(i);
            onUpdate(title);
          },
          isSelected: i === selected,
        };
      });
    },
    [onUpdate, selected],
  );
  const reset = useCallback(() => setSelected(-1), [setSelected]);

  return [transform, reset];
}

function purpleButtonGroup(data: RowData[], transform: (data: RowData[]) => RowTransform[]) {
  return (
    <>
      {transform(data).map(({ title, value, isLast, id, onClick, isSelected }) => {
        return (
          <button
            type="button"
            key={id}
            className={classNames(
              "px-4 py-2.5 hover:bg-violet-200",
              { "border-r": !isLast },
              { "bg-violet-200": isSelected },
            )}
            title={title}
            onClick={onClick}
          >
            {value}
          </button>
        );
      })}
    </>
  );
}

interface GenericInputProps {
  label: string;
  formKey: keyof FormState;
  shortcuts?: RowData[];
  datalist?: string[];
}

const GenericInput: React.FC<GenericInputProps> = ({ label, shortcuts, datalist, formKey }) => {
  const form = useBearStore((state) => state.form);
  const updateForm = useBearStore((state) => state.updateForm);
  const inputRef = useRef<HTMLInputElement>(null);
  const [transform, reset] = useButtonState2((value) => {
    updateForm({ [formKey]: value });
    if (inputRef.current) {
      inputRef.current.value = value;
    }
  });
  const datalistId = useId();

  useEffect(() => {
    if (inputRef.current && formKey) {
      inputRef.current.value = form[formKey] ?? "";
    }
  }, []);

  const inputProps = datalist ? { list: datalistId } : { type: "text" };
  return (
    <>
      <div className="flex justify-start col-span-2">
        <label htmlFor="first-name" className="text-sm font-medium text-gray-500 h-min">
          {label}
        </label>
      </div>
      <div className="flex col-span-4 gap-8">
        {shortcuts && (
          <div className="flex text-sm font-semibold border rounded-lg text-slate-600">
            {purpleButtonGroup(shortcuts, transform)}
          </div>
        )}
        <input
          {...inputProps}
          ref={inputRef}
          className="w-0 min-w-0 px-3 py-2 text-base border border-gray-300 rounded-md shadow-sm grow focus:border-indigo-500 focus:ring-indigo-500"
          onInput={(e: ChangeEvent<HTMLInputElement>) => {
            updateForm({ [formKey]: e.target.value });
          }}
        />
        {datalist && (
          <datalist id={datalistId}>
            {datalist.map((value, i) => (
              <option key={i} value={value} />
            ))}
          </datalist>
        )}
        <button
          type="button"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.value = "";
            }
            reset();
            updateForm({ [formKey]: "" });
          }}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

function Name() {
  const data = [
    { title: "John Doe", value: "M" },
    { title: "Jane Doe", value: "F" },
  ];
  return <GenericInput label="Name" shortcuts={data} formKey="name" />;
}

function Gender() {
  const data = [
    { title: "Male", value: "M" },
    { title: "Female", value: "F" },
  ];
  return <GenericInput label="Gender" shortcuts={data} formKey="gender" />;
}

function SexualOrientation() {
  const data = [
    { title: "Straight", value: "S" },
    { title: "Gay", value: "G" },
    { title: "Lesbian", value: "L" },
    { title: "Bisexual", value: "B" },
  ];
  const datalist = ["Straight", "Gay", "Lesbian", "Bisexual", "Other", "Unknown", "Decline to answer"];
  return <GenericInput label="Sexual Orientation" shortcuts={data} datalist={datalist} formKey="sexualOrientation" />;
}

function Race() {
  const data = [
    { title: "Black", value: "B" },
    { title: "Asian", value: "A" },
    { title: "White", value: "W" },
    { title: "Latino", value: "L" },
  ];
  const datalist = [
    "African American/Black",
    "Asian",
    "Caucasian/White",
    "Hispanic/Latino",
    "Native American / Alsaka Native +",
    "Native Hawaiian / Other Pacific Islander",
    "Two or more of above",
    "Other",
    "Decline to answer",
    "Did not ask",
  ];
  return <GenericInput label="Race" shortcuts={data} datalist={datalist} formKey="race" />;
}

function ServedInMilitary() {
  const data = [{ title: "No", value: "N" }];
  const datalist = [
    "Yes - I am currently on Active Duty",
    "Yes - I am in National Guard/Reserves but not currently activated",
    "Yes - I have previously served in the US military",
    "No - I have not served in the US military",
    "Decline to answer",
    "Did not ask",
  ];
  return <GenericInput label="Served in Military" shortcuts={data} datalist={datalist} formKey="servedInMilitary" />;
}

function MilitaryFamily() {
  const data = [
    { title: "Yes", value: "Y" },
    { title: "No", value: "N" },
  ];
  const datalist = [
    "Yes - A family member serves/has served in the US military",
    "No - A family member has not served in the US military",
    "Decline to answer",
    "Did not ask",
  ];
  return <GenericInput label="Military Family" shortcuts={data} datalist={datalist} formKey="militaryFamily" />;
}

const FindOurNumber: React.FC = () => {
  const datalist = [
    "Agency",
    "Hotline",
    "Bus/Train Ads/Billboards",
    "Community Event",
    "DDH Website",
    "Disaster Relief Organization",
    "Friend/Relative",
    "Helath/Mental Health Professional",
    "Internet Search",
    "Repeat Caller",
    "School",
    "Social Media",
    "Media - excluding social media",
    "Warm/Cold Transfer",
    "Unknown",
    "Other",
    "Did not ask",
    "Decline to answer",
  ];
  return <GenericInput label="How did you find our number?" datalist={datalist} formKey="howDidYouHear" />;
};

const RiskAssessment: React.FC<{ label: string; hideYN?: boolean; formKey: keyof FormState }> = ({
  label,
  hideYN,
  formKey,
}) => {
  const data = [
    { title: "Yes", value: "Y" },
    { title: "No", value: "N" },
  ];
  const props = hideYN ? {} : { shortcuts: data };
  return <GenericInput label={label} {...props} formKey={formKey} />;
};

const SRI: React.FC<{ label: string; formKey: keyof FormState }> = ({ label, formKey }) => {
  const data = [
    { title: "1", value: "1" },
    { title: "2", value: "2" },
    { title: "3", value: "3" },
    { title: "4", value: "4" },
    { title: "5", value: "5" },
  ];
  return <GenericInput label={label} shortcuts={data} formKey={formKey} />;
};

const Notes: React.FC = () => {
  const form = useBearStore((state) => state.form);
  const updateForm = useBearStore((state) => state.updateForm);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.value = form.notes ?? "";
    }
  }, []);

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "";
      textAreaRef.current.style.height = `${e.target.scrollHeight}px`;
    }
    updateForm({ notes: e.target.value });
  };

  return (
    <>
      <div className="flex justify-start col-span-2">
        <label htmlFor="first-name" className="text-sm font-medium text-gray-500 h-min">
          Notes
        </label>
      </div>
      <div className="col-span-4">
        <textarea
          ref={textAreaRef}
          className="block w-full px-3 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default function SPC() {
  return (
    <div className="grid h-full grid-cols-1 justify-items-center bg-slate-100">
      {/* <Head>
        <title>SPC Half Sheet</title>
      </Head> */}
      <div className="container md:max-w-2xl">
        <div className="grid justify-center grid-cols-1">
          <div className="col-span-1 py-8">
            <div>
              <div className="overflow-hidden shadow sm:rounded-xl">
                <div className="grid grid-cols-6 gap-6 px-4 py-5 bg-white sm:p-6">
                  <h2 className="col-span-6 text-base font-semibold">Demographics</h2>
                  <Name />
                  <GenericInput label="Age" formKey="age" />
                  <Gender />
                  <SexualOrientation />
                  <GenericInput label="Zip" formKey="zip" />
                  <Race />
                  <ServedInMilitary />
                  <MilitaryFamily />
                  <FindOurNumber />

                  <hr className="col-span-6" />
                  <h2 className="col-span-6 text-base font-semibold">Risk Assessment</h2>
                  <RiskAssessment label="Thoughts" formKey="thoughts" />
                  <RiskAssessment label="Harm Today" formKey="harmToday" />
                  <RiskAssessment label="Plan" formKey="plan" />
                  <RiskAssessment label="Means" formKey="means" />
                  <RiskAssessment label="Timeline" formKey="timeline" />
                  <SRI label="SRI Start" formKey="sriStart" />
                  <RiskAssessment label="Prior Thoughts" formKey="priorThoughts" />
                  <RiskAssessment label="Prior Attempts" formKey="priorAttempts" />
                  <RiskAssessment label="Intoxicated" formKey="intoxicated" />
                  <RiskAssessment label="Gun" formKey="gun" />
                  <RiskAssessment label="Diagnosis (Dx)" hideYN={true} formKey="diagnosis" />
                  <RiskAssessment label="Prescription (Rx)" hideYN={true} formKey="prescription" />
                  <RiskAssessment label="Homicidal" formKey="homicidal" />
                  <SRI label="SRI End" formKey="sriEnd" />
                  <hr className="col-span-6" />
                  <Notes />
                  <GenericInput label="Safety Plan" formKey="safetyPlan" />
                </div>
                <div className="px-4 py-3 text-right bg-gray-50 sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
