import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Label } from "./ui/label";
import { useId, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

export function DeviceCombobox({
  devices,
  name,
  errors,
}: {
  devices: Array<{ id: string; name: string }>;
  name: string;
  errors?: Array<string>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("desktop");
  const id = useId();

  return (
    <div className="flex flex-col gap-y-2">
      <Label htmlFor={id}>Select Device type:</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <input hidden name={name} value={value} readOnly id={id} />
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[250px] justify-between py-5"
          >
            {value
              ? devices.find((device) => device.id == value)?.name
              : "Select device type..."}

            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {errors?.map((error) => {
          return (
            <p key={error} className="text-destructive">
              {error}
            </p>
          );
        })}
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search device..." />
            <CommandEmpty>No device found</CommandEmpty>
            <CommandGroup>
              {devices.map((device) => {
                return (
                  <CommandItem
                    key={device.id}
                    onSelect={() => {
                      setValue(device.id === value ? "desktop" : device.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === device.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {device.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
