"use client";

import React, { useEffect, useState } from "react";
import TeamSection from "@/components/TeamSection";
import { motion } from "motion/react";
import { createClient } from "@/utils/supabase/client";

type Person = {
  id: number;
  full_name: string;
  profile_image: string;
  email: string | null;
  linkedin: string | null;
  instagram: string | null;
  twitter: string | null;
  display_order: number;
  teams: {
    id: number;
    name: string;
    display_order: number;
  };
  roles: {
    id: number;
    name: string;
  };
};

function groupByTeam(people: Person[]) {
  const map: Record<
    string,
    { teamOrder: number; members: any[] }
  > = {};

  people.forEach((p) => {
    const teamName = p.teams.name;

    if (!map[teamName]) {
      map[teamName] = {
        teamOrder: p.teams.display_order,
        members: [],
      };
    }

    map[teamName].members.push({
      name: p.full_name,
      desig: p.roles.name,
      imageUrl: p.profile_image,
      email: p.email,
      linkedin: p.linkedin,
      instagram: p.instagram,
      twitter: p.twitter,
    });
  });

  return Object.entries(map).sort(
    (a, b) => a[1].teamOrder - b[1].teamOrder
  );
}

export default function Home() {
  const [sections, setSections] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTeam() {
      const { data, error } = await supabase
        .from("people")
        .select(`
          id,
          full_name,
          profile_image,
          email,
          linkedin,
          instagram,
          twitter,
          display_order,
          teams (
            id,
            name,
            display_order
          ),
          roles (
            id,
            name
          )
        `)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      setSections(groupByTeam(data as Person[]));
    }

    fetchTeam();
  }, [supabase]);

  return (
    <div className="min-h-screen py-14 px-6 sm:p-20 relative overflow-hidden">
      <motion.h1
        className="text-center text-6xl pb-4 font-bold mb-6 mt-8 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75 }}
      >
        Meet the Team
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#467eb5]"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.75, delay: 0.3 }}
        />
      </motion.h1>

      {sections.map(([teamName, data]) => (
        <div key={teamName}>
          <TeamSection title={teamName} members={data.members} />
          <br />
          <br />
        </div>
      ))}
    </div>
  );
}
