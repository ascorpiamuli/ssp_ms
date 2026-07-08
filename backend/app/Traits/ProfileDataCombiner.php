<?php

namespace App\Traits;

use App\Models\CatechismRequest;
use App\Models\SccMember;
use App\Models\Upload;
use App\Models\TreasuryCommittee;
use App\Models\WelfareCommitteeMember;

trait ProfileDataCombiner
{
  /**
   * Combine user and profile data into a single array
   */
  private function combineUserAndProfileData($user, $profile): array
  {
    $userData = $user->toArray();
    $profileData = $profile ? $profile->toArray() : [];

    foreach ($profileData as $key => $value) {
      if (!is_null($value) && $value !== '') {
        $userData[$key] = $value;
      }
    }

    return $userData;
  }

  /**
   * Add SCC membership data to combined array
   */
  private function addSccMembershipToData(array &$data, $profile): void
  {
    if (!$profile) {
      $data['scc_membership'] = null;
      return;
    }

    $sccMember = SccMember::where('profile_id', $profile->id)
      ->with('scc')
      ->first();

    if ($sccMember) {
      $data['scc_membership'] = [
        'id' => $sccMember->id,
        'scc_id' => $sccMember->scc_id,
        'position' => $sccMember->position,
        'status' => $sccMember->status,
        'joined_at' => $sccMember->joined_at,
        'verified_by' => $sccMember->verified_by,
        'verified_at' => $sccMember->verified_at,
        'scc' => $sccMember->scc ? [
          'id' => $sccMember->scc->id,
          'name' => $sccMember->scc->name,
          'code' => $sccMember->scc->code,
        ] : null,
      ];
    } else {
      $data['scc_membership'] = null;
    }
  }

  /**
   * Add Treasury Committee membership data to combined array
   */
  private function addTreasuryCommitteeMembershipToData(array &$data, $user): void
  {
    if (!$user) {
      $data['treasury_committee_membership'] = null;
      return;
    }

    $treasuryMember = TreasuryCommittee::where('user_id', $user->id)
      ->where('is_active', true)
      ->with('appointedBy')
      ->first();

    if ($treasuryMember) {
      $data['treasury_committee_membership'] = [
        'id' => $treasuryMember->id,
        'role' => $treasuryMember->role,
        'role_label' => $treasuryMember->role_label,
        'member_type' => $treasuryMember->member_type,
        'member_type_label' => $treasuryMember->member_type_label,
        'appointed_date' => $treasuryMember->appointed_date,
        'end_date' => $treasuryMember->end_date,
        'is_active' => $treasuryMember->is_active,
        'responsibilities' => $treasuryMember->responsibilities,
        'appointed_by' => $treasuryMember->appointed_by,
        'appointed_by_name' => $treasuryMember->appointedBy ? $treasuryMember->appointedBy->full_name : null,
      ];
    } else {
      $data['treasury_committee_membership'] = null;
    }
  }

  /**
   * Add Welfare Committee membership data to combined array
   */
  private function addWelfareCommitteeMembershipToData(array &$data, $user): void
  {
    if (!$user) {
      $data['welfare_committee_membership'] = null;
      return;
    }

    $welfareMember = WelfareCommitteeMember::where('user_id', $user->id)
      ->where('is_active', true)
      ->with('user')
      ->first();

    if ($welfareMember) {
      $data['welfare_committee_membership'] = [
        'id' => $welfareMember->id,
        'role' => $welfareMember->role,
        'role_label' => $this->getWelfareRoleLabel($welfareMember->role),
        'appointed_date' => $welfareMember->appointed_date,
        'term_end_date' => $welfareMember->term_end_date,
        'is_active' => $welfareMember->is_active,
        'responsibilities' => $welfareMember->responsibilities,
      ];
    } else {
      $data['welfare_committee_membership'] = null;
    }
  }

  /**
   * Get welfare committee role label
   */
  private function getWelfareRoleLabel(string $role): string
  {
    $labels = [
      'chairperson' => 'Chairperson',
      'vice_chairperson' => 'Vice Chairperson',
      'secretary' => 'Secretary',
      'treasurer' => 'Treasurer',
      'member' => 'Member',
    ];
    return $labels[$role] ?? ucfirst($role);
  }

  /**
   * Add all committee memberships to combined array
   */
  private function addAllCommitteeMembershipsToData(array &$data, $user): void
  {
    $this->addTreasuryCommitteeMembershipToData($data, $user);
    $this->addWelfareCommitteeMembershipToData($data, $user);
  }

  /**
   * Add uploads data to combined array
   */
  private function addUploadsToData(array &$data, $user): void
  {
    $baptismalCertificates = Upload::where('user_id', $user->id)
      ->where('file_type', 'baptismal_certificate')
      ->where('is_active', true)
      ->orderBy('created_at', 'desc')
      ->get();

    $data['uploads'] = [
      'baptismal_certificates' => $baptismalCertificates
    ];
  }

  /**
   * Add catechism request data to combined array
   */
  private function addCatechismRequestToData(array &$data, $user, $profile): void
  {
    $catechismRequest = CatechismRequest::where('user_id', $user->id)
      ->orderBy('created_at', 'desc')
      ->first();

    if ($profile && $profile->is_baptised && $catechismRequest) {
      $data['catechism_request'] = [
        'id' => $catechismRequest->id,
        'type' => $catechismRequest->type,
        'type_label' => $catechismRequest->getTypeLabel(),
        'type_icon' => $catechismRequest->getTypeIcon(),
        'message' => $catechismRequest->message,
        'status' => $catechismRequest->status,
        'has_baptismal_certificate' => $catechismRequest->has_baptismal_certificate,
        'baptismal_certificate_url' => $catechismRequest->baptismal_certificate_url,
        'certificate_verification_status' => $catechismRequest->certificate_verification_status,
        'notes' => $catechismRequest->notes,
        'rejection_reason' => $catechismRequest->rejection_reason,
        'certificate_rejection_reason' => $catechismRequest->certificate_rejection_reason,
        'approved_by' => $catechismRequest->approved_by,
        'approved_at' => $catechismRequest->approved_at,
        'certificate_verified_by' => $catechismRequest->certificate_verified_by,
        'certificate_verified_at' => $catechismRequest->certificate_verified_at,
        'completed_at' => $catechismRequest->completed_at,
        'created_at' => $catechismRequest->created_at,
        'updated_at' => $catechismRequest->updated_at,
      ];
      $data['catechism_request_id'] = $catechismRequest->id;
    } else {
      $data['catechism_request'] = null;
      $data['catechism_request_id'] = null;
    }

    $data['catechism_request_note'] = $profile->catechism_request_note ?? null;
  }

  /**
   * Add profile complete status
   */
  private function addProfileStatusToData(array &$data, $profile): void
  {
    $data['has_profile'] = $profile !== null && $profile->exists;
    $data['profile_completed'] = $profile ? $profile->isComplete() : false;
  }
}
