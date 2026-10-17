import React from 'react';
import { UserProfile, Certificate, CVTemplateId } from '../types';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Briefcase, 
  GraduationCap, 
  CheckCircle, 
  Car, 
  Globe2, 
  Users 
} from 'lucide-react';

interface CVRendererProps {
  profile: UserProfile;
  certificates: Certificate[];
  template: CVTemplateId;
}

export const CVRenderer: React.FC<CVRendererProps> = ({ profile, certificates, template }) => {
  const experiences = profile.structuredExperiences && profile.structuredExperiences.length > 0
    ? profile.structuredExperiences
    : profile.workExperience
    ? [
        {
          id: 'exp-legacy',
          jobTitle: profile.headline || 'Vocational Specialist',
          company: 'Independent / SME Trader',
          location: `${profile.suburb}, ${profile.city}`,
          startDate: '2023',
          endDate: 'Present',
          isCurrent: true,
          responsibilities: profile.workExperience
        }
      ]
    : [];

  const educations = profile.structuredEducations && profile.structuredEducations.length > 0
    ? profile.structuredEducations
    : profile.education
    ? [
        {
          id: 'edu-legacy',
          qualification: profile.education,
          institution: 'Vocational Training / Secondary Education',
          yearCompleted: 'Completed'
        }
      ]
    : [];

  const references = profile.structuredReferences && profile.structuredReferences.length > 0
    ? profile.structuredReferences
    : profile.references
    ? [
        {
          id: 'ref-legacy',
          name: profile.references.split('-')[0]?.trim() || 'Available upon request',
          jobTitle: 'Supervisor / Client Reference',
          company: 'Verified Trade Contact',
          phone: profile.references.match(/\+?\d[\d\s-]{6,}/)?.[0] || 'Provided on demand',
          relationship: 'Professional Contact'
        }
      ]
    : [];

  const languages = profile.languages && profile.languages.length > 0
    ? profile.languages
    : ['English (Fluent)', 'isiNdebele (Fluent)', 'chiShona (Working)'];

  // ==========================================
  // TEMPLATE 1: MODERN TEAL (Clean, contemporary, vibrant accent)
  // ==========================================
  if (template === 'modern_teal') {
    return (
      <div id="cv-print-document" className="bg-white text-slate-900 w-full max-w-[800px] mx-auto p-8 font-sans shadow-lg rounded-2xl print:shadow-none print:p-6 print:rounded-none">
        {/* Header Banner */}
        <div className="border-b-4 border-teal-600 pb-5 mb-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
              {profile.fullName || 'Comfort Nyoni'}
            </h1>
            <p className="text-base font-bold text-teal-700 tracking-wide">
              {profile.headline || 'Vocational Artisan & Technical Specialist'}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1 font-medium">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                {profile.phone || '+263 77 234 5678'}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-teal-600" />
                {profile.email || 'artisan@comfortskills.com'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                {profile.suburb}, {profile.city}, Zimbabwe
              </span>
              {profile.driverLicense && (
                <span className="flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-teal-600" />
                  License: {profile.driverLicense}
                </span>
              )}
            </div>
          </div>
          {profile.avatarUrl && (
            <img 
              src={profile.avatarUrl} 
              alt={profile.fullName} 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-600 shrink-0" 
            />
          )}
        </div>

        {/* 2-Column Body */}
        <div className="grid grid-cols-3 gap-6">
          {/* Main 2-Span Column */}
          <div className="col-span-2 space-y-5">
            {/* Professional Summary */}
            <section className="space-y-1.5">
              <h2 className="text-xs font-black text-teal-800 uppercase tracking-widest border-b border-teal-100 pb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Professional Summary
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed">
                {profile.bio || 'Dedicated, certified vocational artisan and technical operator committed to precision workmanship, strict safety compliance, and high-quality deliverables across Bulawayo and Zimbabwe.'}
              </p>
            </section>

            {/* Work Experience */}
            <section className="space-y-3">
              <h2 className="text-xs font-black text-teal-800 uppercase tracking-widest border-b border-teal-100 pb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Work &amp; Trade Experience
              </h2>
              {experiences.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No previous employment records listed.</p>
              ) : (
                experiences.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex items-start justify-between text-xs">
                      <span className="font-bold text-slate-950">{exp.jobTitle}</span>
                      <span className="text-[11px] font-semibold text-teal-700">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-600">{exp.company} · {exp.location}</p>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{exp.responsibilities}</p>
                  </div>
                ))
              )}
            </section>

            {/* Education */}
            <section className="space-y-2.5">
              <h2 className="text-xs font-black text-teal-800 uppercase tracking-widest border-b border-teal-100 pb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Education &amp; Vocational Training
              </h2>
              {educations.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No formal education listed.</p>
              ) : (
                educations.map((edu) => (
                  <div key={edu.id} className="text-xs flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{edu.qualification}</p>
                      <p className="text-[11px] text-slate-600">{edu.institution}</p>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">{edu.yearCompleted}</span>
                  </div>
                ))
              )}
            </section>

            {/* Traceable References */}
            <section className="space-y-2">
              <h2 className="text-xs font-black text-teal-800 uppercase tracking-widest border-b border-teal-100 pb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Traceable References
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {references.map((ref) => (
                  <div key={ref.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-900">{ref.name}</p>
                    <p className="text-[11px] text-teal-700 font-medium">{ref.jobTitle} · {ref.company}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{ref.phone}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar 1-Span Column */}
          <div className="col-span-1 space-y-5 bg-teal-50/50 p-4 rounded-2xl border border-teal-100/60">
            {/* Key Skills */}
            <section className="space-y-2">
              <h3 className="text-xs font-black text-teal-900 uppercase tracking-wider">
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-1">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-1 bg-white border border-teal-200 text-teal-900 rounded-lg shadow-2xs">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Locally Earned / Verified Certifications */}
            <section className="space-y-2">
              <h3 className="text-xs font-black text-teal-900 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-teal-700" /> Verified Credentials
              </h3>
              <div className="space-y-1.5">
                {certificates.map((cert) => (
                  <div key={cert.id} className="p-2 bg-white rounded-lg border border-teal-200 text-xs">
                    <p className="font-bold text-teal-950 text-[11px]">{cert.courseTitle}</p>
                    <p className="text-[10px] text-slate-500">Score: {cert.scorePercent}% · Code: {cert.verificationCode}</p>
                  </div>
                ))}
                {profile.customCertifications?.map((c, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-teal-200 text-xs">
                    <p className="font-bold text-teal-950 text-[11px]">{c}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Languages */}
            <section className="space-y-1.5">
              <h3 className="text-xs font-black text-teal-900 uppercase tracking-wider flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5 text-teal-700" /> Languages
              </h3>
              <ul className="text-xs text-slate-700 space-y-1">
                {languages.map((l, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px]">
                    <CheckCircle className="w-3 h-3 text-teal-600" /> {l}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 2: EXECUTIVE NAVY (Corporate, formal, authoritative)
  // ==========================================
  if (template === 'executive_navy') {
    return (
      <div id="cv-print-document" className="bg-white text-slate-900 w-full max-w-[800px] mx-auto p-8 font-serif shadow-lg rounded-2xl print:shadow-none print:p-6 print:rounded-none">
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-bold tracking-widest text-slate-950 uppercase font-sans">
              {profile.fullName || 'Comfort Nyoni'}
            </h1>
            <p className="text-sm font-semibold text-slate-700 uppercase tracking-wider font-sans mt-1">
              {profile.headline || 'Vocational Technician & Business Manager'}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs text-slate-600 mt-2 font-sans">
              <span>{profile.phone}</span>
              <span>·</span>
              <span>{profile.email}</span>
              <span>·</span>
              <span>{profile.suburb}, {profile.city}</span>
              {profile.driverLicense && (
                <>
                  <span>·</span>
                  <span>Driver’s Class: {profile.driverLicense}</span>
                </>
              )}
            </div>
          </div>
          {profile.avatarUrl && (
            <img 
              src={profile.avatarUrl} 
              alt={profile.fullName} 
              className="w-20 h-20 rounded-xl object-cover border-2 border-slate-900 shrink-0" 
            />
          )}
        </div>

        <div className="space-y-5">
          <section>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2 font-sans">
              Executive Profile
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {profile.bio || 'Accomplished vocational practitioner with proven hands-on expertise in technical project execution, team supervision, and client satisfaction.'}
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2 font-sans">
              Core Competencies &amp; Technical Skills
            </h2>
            <div className="grid grid-cols-3 gap-2 font-sans text-xs">
              {profile.skills.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2 font-sans">
              Professional Experience
            </h2>
            <div className="space-y-3 font-sans">
              {experiences.map((exp) => (
                <div key={exp.id} className="space-y-0.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-950">
                    <span>{exp.jobTitle} – {exp.company}</span>
                    <span className="text-slate-600">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">{exp.location}</p>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">{exp.responsibilities}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2 font-sans">
              Education &amp; Qualifications
            </h2>
            <div className="space-y-1.5 font-sans text-xs">
              {educations.map((edu) => (
                <div key={edu.id} className="flex justify-between">
                  <span className="font-semibold text-slate-900">{edu.qualification} — {edu.institution}</span>
                  <span className="text-slate-500">{edu.yearCompleted}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2 font-sans">
              Verified Certificates &amp; Licenses
            </h2>
            <div className="grid grid-cols-2 gap-2 font-sans text-xs">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-2 border border-slate-200 rounded">
                  <p className="font-bold text-slate-900 text-[11px]">{cert.courseTitle}</p>
                  <p className="text-[10px] text-slate-500">Score {cert.scorePercent}% · Code {cert.verificationCode}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2 font-sans">
              References
            </h2>
            <div className="grid grid-cols-2 gap-4 font-sans text-xs">
              {references.map((ref) => (
                <div key={ref.id}>
                  <p className="font-bold text-slate-950">{ref.name}</p>
                  <p className="text-slate-600 text-[11px]">{ref.jobTitle}, {ref.company}</p>
                  <p className="text-slate-500 text-[11px]">{ref.phone}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 3: CLEAN MINIMAL (Crisp, high whitespace, Scandinavian aesthetic)
  // ==========================================
  if (template === 'clean_minimal') {
    return (
      <div id="cv-print-document" className="bg-white text-slate-900 w-full max-w-[800px] mx-auto p-10 font-sans shadow-lg rounded-2xl print:shadow-none print:p-6 print:rounded-none">
        <div className="mb-8 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex-1">
            <h1 className="text-4xl font-light text-slate-950 tracking-tight">
              {profile.fullName || 'Comfort Nyoni'}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {profile.headline || 'Technical Artisan & Craftsman'}
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
              <span>{profile.phone}</span>
              <span>{profile.email}</span>
              <span>{profile.suburb}, {profile.city}</span>
              {profile.driverLicense && <span>License: {profile.driverLicense}</span>}
            </div>
          </div>
          {profile.avatarUrl && (
            <img 
              src={profile.avatarUrl} 
              alt={profile.fullName} 
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0" 
            />
          )}
        </div>

        <div className="space-y-6">
          <section className="grid grid-cols-4 gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider col-span-1">About</span>
            <p className="text-xs text-slate-700 leading-relaxed col-span-3">
              {profile.bio || 'Reliable, detail-oriented vocational professional with demonstrated experience handling tools, projects, and client needs with precision and integrity.'}
            </p>
          </section>

          <section className="grid grid-cols-4 gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider col-span-1">Experience</span>
            <div className="col-span-3 space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">{exp.jobTitle}</span>
                    <span className="text-slate-400 text-[11px]">{exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{exp.company} · {exp.location}</p>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">{exp.responsibilities}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-4 gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider col-span-1">Skills</span>
            <div className="col-span-3 flex flex-wrap gap-2 text-xs">
              {profile.skills.map((skill, i) => (
                <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-700 rounded-md border border-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-4 gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider col-span-1">Education</span>
            <div className="col-span-3 space-y-2 text-xs">
              {educations.map((edu) => (
                <div key={edu.id} className="flex justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{edu.qualification}</p>
                    <p className="text-slate-500 text-[11px]">{edu.institution}</p>
                  </div>
                  <span className="text-slate-400 text-[11px]">{edu.yearCompleted}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-4 gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider col-span-1">References</span>
            <div className="col-span-3 grid grid-cols-2 gap-3 text-xs">
              {references.map((ref) => (
                <div key={ref.id} className="text-xs">
                  <p className="font-bold text-slate-900">{ref.name}</p>
                  <p className="text-slate-500 text-[11px]">{ref.jobTitle}, {ref.company}</p>
                  <p className="text-slate-400 text-[11px]">{ref.phone}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 4: TECHNICAL SLATE (Artisan & trade focused, tools, certifications)
  // ==========================================
  if (template === 'technical_slate') {
    return (
      <div id="cv-print-document" className="bg-white text-slate-900 w-full max-w-[800px] mx-auto p-8 font-sans shadow-lg rounded-2xl print:shadow-none print:p-6 print:rounded-none">
        {/* Dark Header */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl mb-6 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400 font-bold block">
              ZIMBABWE VOCATIONAL CV
            </span>
            <h1 className="text-2xl font-black tracking-tight">{profile.fullName || 'Comfort Nyoni'}</h1>
            <p className="text-xs text-slate-300 font-medium">{profile.headline || 'Certified Technical Tradesperson'}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-2 font-mono">
              <span>TEL: {profile.phone}</span>
              <span>LOC: {profile.suburb}, {profile.city}</span>
              {profile.driverLicense && <span>DL: Class {profile.driverLicense}</span>}
            </div>
          </div>
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.fullName} className="w-16 h-16 rounded-xl object-cover border-2 border-teal-500 shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl">
              {profile.fullName.charAt(0) || 'C'}
            </div>
          )}
        </div>

        <div className="space-y-5 text-xs">
          <section>
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs border-b-2 border-slate-900 pb-1 mb-2">
              1. Trade Summary &amp; Safety Compliance
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {profile.bio || 'Skilled artisan with strict adherence to workshop safety regulations, circuit diagrams, accurate fabrication measurements, and dependable project execution.'}
            </p>
          </section>

          <section>
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs border-b-2 border-slate-900 pb-1 mb-2">
              2. Technical Tooling &amp; Trade Skills
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {profile.skills.map((s, idx) => (
                <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-600 rounded-sm"></span>
                  <span className="font-bold text-slate-800">{s}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs border-b-2 border-slate-900 pb-1 mb-2">
              3. Practical Experience &amp; Field Contracts
            </h3>
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{exp.jobTitle}</span>
                    <span className="font-mono text-[11px] text-teal-700">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600">{exp.company} · {exp.location}</p>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">{exp.responsibilities}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs border-b-2 border-slate-900 pb-1 mb-2">
              4. Verified Certifications &amp; Licenses
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-2 border border-teal-200 bg-teal-50/30 rounded">
                  <p className="font-bold text-teal-950">{cert.courseTitle}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Issued: {cert.dateEarned} · Auth: {cert.verificationCode}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs border-b-2 border-slate-900 pb-1 mb-2">
              5. Traceable Workplace References
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {references.map((ref) => (
                <div key={ref.id} className="p-2 bg-slate-50 rounded border border-slate-200">
                  <p className="font-bold text-slate-900">{ref.name}</p>
                  <p className="text-[11px] text-slate-600">{ref.jobTitle} · {ref.company}</p>
                  <p className="text-[11px] text-teal-700 font-mono">{ref.phone}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 5: BOLD COMPACT (1-Page High-Density, Emerald Header)
  // ==========================================
  return (
    <div id="cv-print-document" className="bg-white text-slate-900 w-full max-w-[800px] mx-auto p-6 font-sans shadow-lg rounded-2xl print:shadow-none print:p-4 print:rounded-none">
      <div className="bg-emerald-800 text-white p-5 rounded-xl mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wide">{profile.fullName || 'Comfort Nyoni'}</h1>
          <p className="text-xs font-semibold text-emerald-200">{profile.headline || 'Vocational Specialist'}</p>
          <div className="flex flex-wrap gap-3 text-[11px] text-emerald-100 mt-1.5 font-medium">
            <span>{profile.phone}</span>
            <span>{profile.email}</span>
            <span>{profile.suburb}, {profile.city}</span>
            {profile.driverLicense && <span>License: {profile.driverLicense}</span>}
          </div>
        </div>
        {profile.avatarUrl && (
          <img src={profile.avatarUrl} alt={profile.fullName} className="w-16 h-16 rounded-xl object-cover border border-emerald-400 shrink-0" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="col-span-2 space-y-4">
          <section>
            <h2 className="text-xs font-black text-emerald-900 uppercase border-b border-emerald-200 pb-0.5 mb-1">
              Summary
            </h2>
            <p className="text-slate-700 leading-snug">{profile.bio || 'Hardworking vocational specialist with extensive technical capabilities and verified track record.'}</p>
          </section>

          <section>
            <h2 className="text-xs font-black text-emerald-900 uppercase border-b border-emerald-200 pb-0.5 mb-1.5">
              Experience
            </h2>
            <div className="space-y-2.5">
              {experiences.map((exp) => (
                <div key={exp.id} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{exp.jobTitle} · {exp.company}</span>
                    <span className="text-emerald-700 text-[11px]">{exp.startDate}–{exp.isCurrent ? 'Pres' : exp.endDate}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] whitespace-pre-line leading-relaxed">{exp.responsibilities}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-black text-emerald-900 uppercase border-b border-emerald-200 pb-0.5 mb-1">
              Education
            </h2>
            <div className="space-y-1">
              {educations.map((edu) => (
                <div key={edu.id} className="flex justify-between text-[11px]">
                  <span className="font-bold text-slate-800">{edu.qualification} ({edu.institution})</span>
                  <span className="text-slate-500">{edu.yearCompleted}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-1 space-y-4 border-l border-slate-100 pl-3">
          <section>
            <h2 className="text-xs font-black text-emerald-900 uppercase border-b border-emerald-200 pb-0.5 mb-1.5">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1">
              {profile.skills.map((s, idx) => (
                <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-900 rounded">
                  {s}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-black text-emerald-900 uppercase border-b border-emerald-200 pb-0.5 mb-1.5">
              Certifications
            </h2>
            <div className="space-y-1 text-[10px]">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-1.5 bg-slate-50 rounded border border-slate-200">
                  <p className="font-bold text-slate-900">{cert.courseTitle}</p>
                  <p className="text-emerald-800 font-mono">{cert.verificationCode}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-black text-emerald-900 uppercase border-b border-emerald-200 pb-0.5 mb-1">
              References
            </h2>
            <div className="space-y-1.5 text-[10px]">
              {references.map((ref) => (
                <div key={ref.id}>
                  <p className="font-bold text-slate-900">{ref.name}</p>
                  <p className="text-slate-600">{ref.company}</p>
                  <p className="text-emerald-700 font-mono">{ref.phone}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
