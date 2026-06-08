import * as React from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'
import { DayPicker, type DayButton } from 'react-day-picker';
import { cn } from '../../lib/utils';
import '../../css/calendar.css';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(className)}
      classNames={classNames}
      components={{
        Chevron: ({ orientation, className: chevronClass, ...chevronProps }) => {
          if (orientation === 'left') {
            return <MdKeyboardArrowLeft size={18} {...chevronProps} />;
          }
          if (orientation === 'right') {
            return <MdKeyboardArrowRight size={18} {...chevronProps} />;
          }
          return <ChevronDownIcon className={cn('rdp-chevron', chevronClass)} size={16} {...chevronProps} />;
        },
        DayButton: CalendarDayButton,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <button
      ref={ref}
      className={cn('rdp-day_button', className)}
      data-day={day.date.toLocaleDateString()}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
