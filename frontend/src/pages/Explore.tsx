import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AddressHoverCard } from "@/components/history/AddressHoverCard";
import { AppShell } from "@/components/layout/AppShell";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";