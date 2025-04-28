"use client";

import * as React from "react";
import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export interface MultiEmailInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function MultiEmailInput({
  value,
  onChange,
  onBlur,
  error,
  className,
  placeholder = "Enter email address",
  disabled = false,
  ...props
}: MultiEmailInputProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) return;
    
    if (!isValidEmail(trimmedEmail)) {
      // Show validation error
      return;
    }
    
    if (!value.includes(trimmedEmail)) {
      onChange([...value, trimmedEmail]);
    }
    
    setInputValue("");
  };

  const removeEmail = (email: string) => {
    onChange(value.filter((e) => e !== email));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      addEmail(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeEmail(value[value.length - 1]);
    } else if (e.key === "," && inputValue) {
      e.preventDefault();
      const emailsToAdd = inputValue.split(",").map(e => e.trim()).filter(Boolean);
      
      if (emailsToAdd.length) {
        const validEmails = emailsToAdd.filter(isValidEmail);
        if (validEmails.length) {
          const newEmails = [...value];
          
          for (const email of validEmails) {
            if (!newEmails.includes(email)) {
              newEmails.push(email);
            }
          }
          
          onChange(newEmails);
          setInputValue("");
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const emailsToAdd = pastedText
      .split(/[,;\s]+/)
      .map(e => e.trim())
      .filter(Boolean);
    
    if (emailsToAdd.length) {
      const validEmails = emailsToAdd.filter(isValidEmail);
      if (validEmails.length) {
        const newEmails = [...value];
        
        for (const email of validEmails) {
          if (!newEmails.includes(email)) {
            newEmails.push(email);
          }
        }
        
        onChange(newEmails);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleContainerClick}
      className={cn(
        "flex flex-wrap items-center gap-1.5 min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors",
        error ? "border-destructive" : "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {value.map((email) => (
        <Badge 
          key={email} 
          variant="secondary"
          className="flex items-center gap-1 px-2 py-0.5 text-xs"
        >
          {email}
          {!disabled && (
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                removeEmail(email);
              }} 
            />
          )}
        </Badge>
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={onBlur}
        placeholder={value.length === 0 ? placeholder : ""}
        disabled={disabled}
        className="flex-1 min-w-[120px] border-none shadow-none p-0 h-7 focus-visible:ring-0 focus-visible:ring-offset-0"
        {...props}
      />
      {error && (
        <div className="w-full text-destructive text-xs mt-1">{error}</div>
      )}
    </div>
  );
}
