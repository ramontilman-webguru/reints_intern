"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils"; // Assuming you have this utility
import { X, Check } from "lucide-react";

export function TagInput({
  availableTags = [], // All possible tags
  value = [], // Currently selected tags
  onChange, // Function to call when tags change (passes the new array of tags)
  placeholder = "Add tags...",
  maxTags = 10, // Optional limit
}) {
  const inputRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleTagSelect = (tag) => {
    setInputValue("");
    if (value.length < maxTags && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    // Keep popover open? Maybe close it? For now, let's keep it open for multi-select.
    // setOpen(false);
  };

  const handleTagCreate = (tag) => {
    const newTag = tag.trim();
    if (
      newTag &&
      value.length < maxTags &&
      !value.includes(newTag) &&
      !availableTags.includes(newTag) // Only create if truly new
    ) {
      onChange([...value, newTag]);
    }
    setInputValue("");
    // Maybe close popover after creation?
    // setOpen(false);
  };

  const handleTagRemove = (tagToRemove) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault(); // Prevent form submission if inside a form
      // Check if input value matches an available tag first
      const matchingTag = availableTags.find(
        (t) => t.toLowerCase() === inputValue.toLowerCase()
      );
      if (matchingTag && !value.includes(matchingTag)) {
        handleTagSelect(matchingTag);
      } else if (
        !availableTags.includes(inputValue.trim()) &&
        inputValue.trim()
      ) {
        // If not matching and not empty, create it
        handleTagCreate(inputValue);
      } else {
        // If it exists but is already selected, just clear input
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      handleTagRemove(value[value.length - 1]);
    }
  };

  // Filter available tags based on input, excluding already selected ones
  const filteredTags = availableTags.filter(
    (tag) =>
      !value.includes(tag) &&
      tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className='flex flex-wrap gap-2 items-center border rounded-md p-1 min-h-[40px]'>
        {value.map((tag) => (
          <Badge key={tag} variant='secondary'>
            {tag}
            <button
              type='button' // Important for forms
              className='ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
              onClick={() => handleTagRemove(tag)}
            >
              <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
            </button>
          </Badge>
        ))}
        <PopoverTrigger asChild onClick={() => inputRef.current?.focus()}>
          {/* We use a div wrapper to allow clicking the entire input area to trigger */}
          <div className='flex-1'>
            <input
              ref={inputRef}
              type='text'
              placeholder={
                value.length >= maxTags ? "Max tags reached" : placeholder
              }
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className='flex-grow p-1 bg-transparent outline-none text-sm min-w-[100px] disabled:cursor-not-allowed' // Added min-w
              disabled={value.length >= maxTags}
              onFocus={() => setOpen(true)} // Open popover on focus
              // onBlur={() => setOpen(false)} // Close on blur might be annoying
            />
          </div>
        </PopoverTrigger>
      </div>

      <PopoverContent
        className='w-[--radix-popover-trigger-width] p-0'
        align='start'
      >
        <Command>
          <CommandInput
            placeholder='Search or create tag...'
            value={inputValue}
            onValueChange={setInputValue} // Use direct setter for CommandInput compatibility
            onKeyDown={handleKeyDown} // Keep keydown handler for Enter/Backspace
            className='border-none focus:ring-0' // Remove default CommandInput ring
          />
          <CommandList>
            <CommandEmpty>
              {inputValue.trim() && !availableTags.includes(inputValue.trim())
                ? `Press Enter to create "${inputValue.trim()}"`
                : "No tags found."}
            </CommandEmpty>
            <CommandGroup heading='Suggestions'>
              {filteredTags.map((tag) => (
                <CommandItem
                  key={tag}
                  value={tag} // Important for Command filtering/selection
                  onSelect={() => handleTagSelect(tag)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(tag) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {tag}
                </CommandItem>
              ))}
            </CommandGroup>
            {/* Option to create the current input value if it's not empty and not in available tags */}
            {inputValue.trim() &&
              !availableTags.find(
                (t) => t.toLowerCase() === inputValue.trim().toLowerCase()
              ) && (
                <CommandGroup heading='Create New'>
                  <CommandItem
                    key={`create-${inputValue}`}
                    value={inputValue} // Use input value
                    onSelect={() => handleTagCreate(inputValue)}
                  >
                    Create "{inputValue.trim()}"
                  </CommandItem>
                </CommandGroup>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
